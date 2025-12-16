    import { createClient } from 'https://esm.sh/@supabase/supabase-js'

    const supabase = createClient(
    'http://192.168.3.128:8000', // 本地 Supabase 地址
    Deno.env.get('SERVICE_ROLE_KEY')!
    )

    const WX_APPID = 'wx864aa1ca232aebaf'
    const WX_SECRET = 'ceb73ba0f0a0b7c0ef4319e127fe3fad'

    Deno.serve(async (req) => {
    const { code } = await req.json()

    if (!code) {
        return new Response(JSON.stringify({ error: 'code 缺失' }), { status: 400 })
    }

    // 微信接口获取 openid
    const wxRes = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
    )

    const wxData = await wxRes.json()

    if (!wxData.openid) {
        return new Response(JSON.stringify(wxData), { status: 400 })
    }

    const openid = wxData.openid

    // 查询用户
    let { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('openid', openid)
        .single()

    // 如果用户不存在，插入
    if (!user) {
        const res = await supabase
        .from('users')
        .insert({
            openid,
            nickname: '',       // 后续可更新
            avatar_url: '',     // 后续可更新
            created_at: new Date(),
            last_login: new Date()
        })
        .select()
        .single()

        user = res.data
    } else {
        // 已存在 → 更新 last_login
        await supabase
        .from('users')
        .update({ last_login: new Date() })
        .eq('openid', openid)
    }

    return new Response(JSON.stringify({ user }), {
        headers: { 'Content-Type': 'application/json' }
    })
    })


