import { createClient } from '@supabase/supabase-js'
import { WechatAuthClient } from '@supabase/wechat-js'

// 🚨 警惕：安全风险点！这些值将暴露在小程序代码包中。
// 建议：在生产环境中，AppSecret 应该通过后端服务获取，而不是直接暴露在前端代码中
export const WECHAT_APPID = 'wx864aa1ca232aebaf'
export const WECHAT_SECRET = 'aa6655dc9f2ef6dedae249c96c59bb10'
export const SUPABASE_URL = 'https://jhxoiswzbcnhveqvvjbm.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeG9pc3d6YmNuaHZlcXZ2amJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjExNDAsImV4cCI6MjA3MDAzNzE0MH0.SI-1FT6skqCtrYIKa9T8CyytuI9vr4AZafxFWuwXlXs'

// 初始化 Supabase 客户端，配置微信小程序存储适配器
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    // 使用微信小程序适配器
    fetch: WechatAuthClient.fetch,
  },
  auth: {
    // 使用 uni 的存储 API 作为 Supabase 的存储适配器
    storage: {
      getItem: (key: string) => {
        try {
          return uni.getStorageSync(key) || null
        } catch (error) {
          console.error('Storage getItem error:', error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          uni.setStorageSync(key, value)
        } catch (error) {
          console.error('Storage setItem error:', error)
        }
      },
      removeItem: (key: string) => {
        try {
          uni.removeStorageSync(key)
        } catch (error) {
          console.error('Storage removeItem error:', error)
        }
      },
    },
  },
})
