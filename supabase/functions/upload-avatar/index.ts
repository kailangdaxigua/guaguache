import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(
  'http://192.168.3.128:8000', // 本地 Supabase 地址
  Deno.env.get('SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { openid, fileData, fileName } = await req.json()

  if (!openid || !fileData) {
    return new Response(JSON.stringify({ error: '参数缺失' }), { status: 400 })
  }

  const filename = fileName || `avatars/${openid}_${Date.now()}.png`

  try {
    // 将 base64 转换为 ArrayBuffer
    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // 上传到 Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filename, bytes, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 400 })
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)

    return new Response(JSON.stringify({ 
      publicUrl: urlData.publicUrl 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})

