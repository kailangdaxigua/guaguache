// services/profile.js
// ⚠️ 本地 Supabase Functions 地址
const UPDATE_PROFILE_API = 'http://192.168.3.128:8000/functions/v1/update-profile'
const UPLOAD_AVATAR_API = 'http://192.168.3.128:8000/functions/v1/upload-avatar'

/**
 * 更新用户资料
 * @param {string} openid 用户 openid
 * @param {Object} updateData { nickname, avatar_url }
 */
export async function updateProfile(openid, updateData) {
  // 1. 先校验有没有传入 openid
  if (!openid) {
    console.error("更新失败：缺少 openid")
    throw new Error('未登录用户')
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: UPDATE_PROFILE_API,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        openid,
        nickname: updateData.nickname,
        avatar_url: updateData.avatar_url
      },
      success: (res) => {
        if (res.data?.error) {
          reject(new Error(res.data.error))
          return
        }
        // 更新本地缓存
        const user = uni.getStorageSync('user')
        if (user) {
          const updatedUser = { ...user, ...res.data.user }
          uni.setStorageSync('user', updatedUser)
          resolve(updatedUser)
        } else {
          resolve(res.data.user)
        }
      },
      fail: reject
    })
  })
}

/**
 * 上传头像到 Supabase Storage
 * @param {string} openid 用户 openid
 * @param {string} avatarLocalPath 本地路径
 * @returns {string} publicUrl
 */
export async function uploadAvatar(openid, avatarLocalPath) {
  // 1. 先校验有没有传入 openid
  if (!openid) {
    console.error("上传失败：缺少 openid")
    throw new Error('未登录用户')
  }

  return new Promise((resolve, reject) => {
    // 读取文件为 base64
    uni.getFileSystemManager().readFile({
      filePath: avatarLocalPath,
      encoding: 'base64',
      success: (readRes) => {
        // 调用 Edge Function 上传
        uni.request({
          url: UPLOAD_AVATAR_API,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            openid,
            fileData: readRes.data,
            fileName: `avatars/${openid}_${Date.now()}.png`
          },
          success: (uploadRes) => {
            if (uploadRes.data?.error) {
              reject(new Error(uploadRes.data.error))
              return
            }
            resolve(uploadRes.data.publicUrl)
          },
          fail: reject
        })
      },
      fail: reject
    })
  })
}

