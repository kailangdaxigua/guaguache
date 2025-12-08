import { createClient } from '@supabase/supabase-js'
import { WechatAuthClient } from '@supabase/wechat-js'

const SUPABASE_URL = 'https://jhxoiswzbcnhveqvvjbm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeG9pc3d6YmNuaHZlcXZ2amJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjExNDAsImV4cCI6MjA3MDAzNzE0MH0.SI-1FT6skqCtrYIKa9T8CyytuI9vr4AZafxFWuwXlXs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    // 使用微信小程序适配器
    fetch: WechatAuthClient.fetch,
  },
})

