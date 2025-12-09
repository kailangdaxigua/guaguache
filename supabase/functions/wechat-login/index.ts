// Edge Function: WeChat 登录 / 注册入口
// 运行于 Deno（Supabase Edge Functions），通过微信 code 换 openid，
// 然后在 Supabase Auth + profiles 表里查询或创建用户。
// 返回客户端可直接使用的 access_token 和 user_id，用于小程序侧持久化。
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.5';
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

// 微信和 Supabase 环境变量从 Deno.env 获取，部署时在 Edge 环境里配置
const WECHAT_APP_ID = Deno.env.get('WECHAT_APP_ID');
const WECHAT_APP_SECRET = Deno.env.get('WECHAT_APP_SECRET');

// 使用 Service Role Key 初始化 Admin Client，可绕过 RLS 进行管理操作
// 注意：Service Role Key 仅应存放在 Edge Secrets，不要泄漏到前端
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- A. 微信 code2session：用 code 换 openid/unionid ---
    const wechatApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
    // 外部 HTTP 请求，微信返回 openid/unionid 或错误码
    const wechatRes = await fetch(wechatApiUrl);
    const wechatData = await wechatRes.json();

    if (wechatData.errcode) {
      console.error('WeChat API Error:', wechatData);
      return new Response(
        JSON.stringify({ error: 'WeChat login failed', details: wechatData }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { openid, unionid } = wechatData;

    let userId: string;
    let token: string;

    // --- B. 查询是否已有绑定该 openid 的 profile ---
    // 使用 profiles.wechat_openid 判定是否为老用户
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wechat_openid', openid)
      .maybeSingle();

    if (profile) {
      // --- C1. 老用户：获取用户 ID 并生成新的 Session Token ---
      userId = profile.id;
      const {
        data: { session },
        error: sessionError,
      } = await supabaseAdmin.auth.admin.generateSession({ user_id: userId });

      if (sessionError || !session) {
        console.error('Failed to generate session for existing user:', sessionError);
        throw new Error('Failed to create user session.');
      }

      token = session.access_token; // 返回给前端的小程序 JWT
    } else {
      // --- C2. 新用户：创建 Auth 用户并写入 profile ---
      const {
        data: { user: newUser },
        error: authError,
      } = await supabaseAdmin.auth.admin.createUser({
        user_metadata: { wechat_openid: openid, wechat_unionid: unionid },
        email: `${openid}@wechat.local`,
        email_confirm: true,
      });

      if (authError || !newUser) {
        console.error('Supabase Auth User Creation Error:', authError);
        throw new Error('Supabase Auth User Creation Failed');
      }

      userId = newUser.id;

      // 创建 profiles 记录，若失败回滚 Auth 用户
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        wechat_openid: openid,
        wechat_unionid: unionid,
        nickname: '微信用户',
        avatar_url: '',
      });

      if (profileError) {
        console.error('Supabase Profile Insert Error:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Supabase Profile Insert Failed');
      }

      // 新用户创建成功后，立即生成 Session Token
      const {
        data: { session },
        error: sessionError,
      } = await supabaseAdmin.auth.admin.generateSession({ user_id: userId });

      if (sessionError || !session) {
        console.error('Failed to generate session for new user:', sessionError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Failed to create session for new user.');
      }

      token = session.access_token; // 新用户首次生成的 JWT
    }

    // 正常返回：携带 token 和 user_id，供小程序存储
    return new Response(JSON.stringify({ token, user_id: userId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

