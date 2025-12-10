// ✅ Deno/Edge Function 推荐的精确路径，用于确保 Admin API 存在
import { createClient } from 'https://esm.sh/@supabase/supabase-js@latest'; 
import * as jose from 'https://esm.sh/jose@5.2.3';

import 'https://deno.land/x/dotenv@v3.2.2/load.ts';
// 临时诊断代码：验证 Service Key 是否加载，用完后请删除！
const SERVICE_KEY_CHECK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
console.log('Service Key Loaded:', SERVICE_KEY_CHECK ? '✅ Loaded' : '❌ Not Loaded');
console.log('Service Key Length:', SERVICE_KEY_CHECK?.length || 0);

// 微信和 Supabase 环境变量从 Deno.env 获取，部署时在 Edge 环境里配置
const WECHAT_APP_ID = Deno.env.get('WECHAT_APP_ID');
const WECHAT_APP_SECRET = Deno.env.get('WECHAT_APP_SECRET');
// 使用 Supabase JWT Secret（用于签发 Authenticated Token）
const SUPABASE_JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET');

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
    console.log('=== Edge Function 调用开始 ===');
    const { code } = await req.json();
    console.log('接收到的 code:', code ? code.substring(0, 10) + '...' : 'null');
    
    if (!code) {
      console.error('❌ 缺少 code 参数');
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- A. 微信 code2session：用 code 换 openid/unionid ---
    console.log('=== 步骤 A: 检查微信 API 是否成功 ===');
    console.log('WECHAT_APP_ID 是否存在:', WECHAT_APP_ID ? '✅ 存在' : '❌ 缺失');
    console.log('WECHAT_APP_SECRET 是否存在:', WECHAT_APP_SECRET ? '✅ 存在' : '❌ 缺失');
    console.log('WECHAT_APP_ID 长度:', WECHAT_APP_ID?.length || 0);
    console.log('WECHAT_APP_SECRET 长度:', WECHAT_APP_SECRET?.length || 0);
    
    const wechatApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
    console.log('准备调用微信 API...');
    console.log('API URL (隐藏敏感信息):', wechatApiUrl.replace(WECHAT_APP_SECRET || '', '***'));
    
    // 外部 HTTP 请求，微信返回 openid/unionid 或错误码
    const wechatRes = await fetch(wechatApiUrl);
    const wechatData = await wechatRes.json();

    // 诊断点 1：检查微信 API 是否成功
    console.log('微信 API 响应状态:', wechatRes.status);
    console.log('微信 API 响应数据:', JSON.stringify(wechatData));
    
    if (wechatData.errcode) {
      console.error('❌ WeChat API Error:', wechatData);
      console.error('诊断：登录流程卡在 code2session（微信 API）');
      console.error('可能原因：WECHAT_APP_ID 或 WECHAT_APP_SECRET 变量错误');
      console.error('解决方案：检查微信开放平台，确保这两个 Secret 正确地注入到了 Edge Function Secrets');
      return new Response(
        JSON.stringify({ error: 'WeChat login failed', details: wechatData }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { openid, unionid } = wechatData;
    console.log('✅ 微信 API 调用成功');
    console.log('微信返回 openid:', openid ? openid.substring(0, 10) + '...' : 'null');
    console.log('微信返回 unionid:', unionid ? unionid.substring(0, 10) + '...' : 'null');
    console.log('openid 完整长度:', openid?.length || 0);
    console.log('unionid 完整长度:', unionid?.length || 0);
    console.log('========================');

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
      console.log('=== 老用户登录 ===');
      console.log('User ID:', userId);
      
      // 诊断点 2：检查自定义 JWT 生成（jose）
      console.log('=== 步骤 C1: 检查 jose SignJWT（老用户）===');
      console.log('SUPABASE_URL 是否存在:', Deno.env.get('SUPABASE_URL') ? '✅ 存在' : '❌ 缺失');
      console.log('SUPABASE_SERVICE_ROLE_KEY 是否存在:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✅ 存在' : '❌ 缺失');
      console.log('SUPABASE_SERVICE_ROLE_KEY 长度:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0);
      console.log('SUPABASE_JWT_SECRET 是否存在:', SUPABASE_JWT_SECRET ? '✅ 存在' : '❌ 缺失');
      console.log('SUPABASE_JWT_SECRET 长度:', SUPABASE_JWT_SECRET?.length || 0);
      console.log('准备调用 jose SignJWT，sub:', userId);
      
      if (!SUPABASE_JWT_SECRET) {
        console.error('❌ JWT Secret missing in environment variables!');
        throw new Error('Failed to create user token: Secret missing.');
      }

      // 关键：使用 Supabase JWT Secret（字符串）作为 HS256 密钥
      const key = new TextEncoder().encode(SUPABASE_JWT_SECRET);

      const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 天有效期
        role: 'authenticated',
      };

      token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(key);
      
      console.log('✅ Jose JWT Token 创建成功（老用户）');
      console.log('========================');

      // 测试验证：打印 token 原始值
      console.log('=== Token 验证（老用户）===');
      console.log('token raw:', token);
      console.log('Token 类型:', typeof token);
      console.log('Token 长度:', token?.length || 0);
      console.log('Token 是否包含点号:', token?.indexOf('.') !== -1);
      if (token) {
        const parts = token.split('.');
        console.log('Token 分段数量:', parts.length);
        console.log('Token 第一段（前20字符）:', token.substring(0, 20) + '...');
      }
      console.log('========================');
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

      // 新用户创建成功后，立即生成 JWT
      console.log('=== 新用户创建成功，生成 JWT ===');
      console.log('User ID:', userId);
      
      // 诊断点 2：检查自定义 JWT 生成（jose）
      console.log('=== 步骤 C2: 检查 jose SignJWT（新用户）===');
      console.log('SUPABASE_URL 是否存在:', Deno.env.get('SUPABASE_URL') ? '✅ 存在' : '❌ 缺失');
      console.log('SUPABASE_SERVICE_ROLE_KEY 是否存在:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✅ 存在' : '❌ 缺失');
      console.log('SUPABASE_SERVICE_ROLE_KEY 长度:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0);
      console.log('SUPABASE_JWT_SECRET 是否存在:', SUPABASE_JWT_SECRET ? '✅ 存在' : '❌ 缺失');
      console.log('SUPABASE_JWT_SECRET 长度:', SUPABASE_JWT_SECRET?.length || 0);
      console.log('准备调用 jose SignJWT，sub:', userId);
      
      if (!SUPABASE_JWT_SECRET) {
        console.error('❌ JWT Secret missing in environment variables!');
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Failed to create token for new user: Secret missing.');
      }

      // 关键：使用 Supabase JWT Secret（字符串）作为 HS256 密钥
      const key = new TextEncoder().encode(SUPABASE_JWT_SECRET);

      const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 天有效期
        role: 'authenticated',
      };

      token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(key);
      
      console.log('✅ Jose JWT Token 创建成功（新用户）');
      console.log('========================');

      // 测试验证：打印 token 原始值
      console.log('=== Token 验证（新用户）===');
      console.log('token raw:', token);
      console.log('Token 类型:', typeof token);
      console.log('Token 长度:', token?.length || 0);
      console.log('Token 是否包含点号:', token?.indexOf('.') !== -1);
      if (token) {
        const parts = token.split('.');
        console.log('Token 分段数量:', parts.length);
        console.log('Token 第一段（前20字符）:', token.substring(0, 20) + '...');
      }
      console.log('========================');
    }

    // 测试验证：最终返回前的验证
    console.log('=== 最终返回验证 ===');
    console.log('返回的 token raw:', token);
    console.log('返回的 user_id:', userId);
    console.log('Token 格式验证:', token && typeof token === 'string' && token.indexOf('.') !== -1 && token.split('.').length === 3 ? '✅ 有效 JWT' : '❌ 无效格式');
    
    // 验证 token 格式
    if (!token || typeof token !== 'string' || token.indexOf('.') === -1 || token.split('.').length !== 3) {
      console.error('❌ 严重错误：返回的 token 格式无效！');
      console.error('Token 值:', token);
      throw new Error('Generated token is invalid');
    }
    
    console.log('✅ Token 验证通过，准备返回给客户端');
    console.log('========================');
    
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

