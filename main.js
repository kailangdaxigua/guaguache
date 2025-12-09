import { createSSRApp } from 'vue'
import App from './App.vue'

/**
 * 注意：uni-app（Vue3）必须使用 createSSRApp，
 * 否则小程序端 app 实例未初始化会出现 getAppVm 为空导致 "$vm undefined"。
 */
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}

