/// <reference types="@dcloudio/types" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    /** NODE 内置环境变量, 会影响到最终构建生成产物 */
    NODE_ENV: 'development' | 'production'
  }
}

// Vite 环境变量类型定义
interface ImportMetaEnv {
  /** Supabase 项目 URL */
  readonly VITE_SUPABASE_URL: string
  /** Supabase Anon Public Key */
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 声明 uni 全局对象（uniapp 运行时提供）
declare const uni: any
