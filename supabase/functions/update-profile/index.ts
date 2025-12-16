import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(
  'http://192.168.3.128:8000', // 本地 Supabase 地址
  Deno.env.get('SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { openid, nickname, avatar_url } = await req.json()

  if (!openid) {
    return new Response(JSON.stringify({ error: 'openid 缺失' }), { status: 400 })
  }

  // 更新用户资料
  const { data: user, error } = await supabase
    .from('users')
    .update({
      nickname: nickname || '',
      avatar_url: avatar_url || ''
    })
    .eq('openid', openid)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ user }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

