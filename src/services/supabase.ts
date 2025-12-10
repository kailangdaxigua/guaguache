// Supabase 请求配置与辅助方法
// 依赖环境变量：
// - VITE_SUPABASE_URL
// - VITE_SUPABASE_ANON_KEY（公钥，非 service role）
// 登录成功后，会从本地存储读取 supabase_token 和 user_id 作为鉴权信息。

type SupabaseConfig = {
  url: string
  anonKey: string
  token: string
  userId: string
}

export const getSupabaseConfig = (): SupabaseConfig => {
  // 使用 import.meta.env 访问 Vite 环境变量
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  const token = uni.getStorageSync('supabase_token') as string
  const userId = uni.getStorageSync('user_id') as string

  if (!url || !anonKey) {
    throw new Error(
      '缺少 Supabase URL 或 Anon Key，请在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
    )
  }
  if (!token || !userId) {
    throw new Error('未获取到登录态，请先完成登录')
  }

  return { url, anonKey, token, userId }
}

export const buildAuthHeaders = (config: SupabaseConfig) => ({
  Authorization: `Bearer ${config.token}`,
  apikey: config.anonKey
})

export const getPublicAvatarUrl = (config: SupabaseConfig) =>
  `${config.url}/storage/v1/object/public/avatars/${config.userId}.jpg`


