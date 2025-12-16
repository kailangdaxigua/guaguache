import 'https://deno.land/x/dotenv/load.ts'; // 读取 .env
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// 从 env 里读取配置
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;
const WX_APPID = Deno.env.get('WX_APPID')!;
const WX_SECRET = Deno.env.get('WX_SECRET')!;

// 初始化 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        const { code } = await req.json();

        if (!code) {
            return new Response(JSON.stringify({ error: 'code 缺失' }), { status: 400 });
        }

        // 微信接口获取 openid
        const wxRes = await fetch(
            `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
        );

        const wxData = await wxRes.json();

        if (!wxData.openid) {
            return new Response(JSON.stringify(wxData), { status: 400 });
        }

        const openid = wxData.openid;

        // 查询用户
        let { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('openid', openid)
            .single();

        // 如果用户不存在，插入
        if (!user) {
            const res = await supabase
                .from('users')
                .insert({
                    openid,
                    nickname: '',
                    avatar_url: '',
                    created_at: new Date(),
                    last_login: new Date()
                })
                .select()
                .single();
            user = res.data;
        } else {
            // 更新 last_login
            await supabase
                .from('users')
                .update({ last_login: new Date() })
                .eq('openid', openid);
        }

        return new Response(JSON.stringify({ user }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: '服务器内部错误' }), { status: 500 });
    }
});
