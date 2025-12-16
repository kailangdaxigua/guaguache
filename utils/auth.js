// utils/auth.js
// ⚠️ 本地 Supabase Functions 地址
const LOGIN_API = 'http://192.168.3.128:8000/functions/v1/wechat-login'

export function wechatLogin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (!loginRes.code) {
          reject('获取 code 失败')
          return
        }
        uni.request({
          url: LOGIN_API,
          method: 'POST',
          data: { code: loginRes.code },
          success: (res) => {
            if (res.data?.error) {
              reject(res.data.error)
              return
            }
            // 保存用户信息（openid / nickname / avatar_url）
            uni.setStorageSync('user', res.data.user)
            resolve(res.data.user)
          },
          fail: reject
        })
      },
      fail: reject
    })
  })
}


