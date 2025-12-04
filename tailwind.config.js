/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. 明确指定 content 路径，避免扫描不需要的文件
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  // 小程序使用下划线分隔变体（由 taro-tailwind 相关配置处理）
  separator: '_',

  // 2. 禁用未使用的核心插件，减少产物体积
  corePlugins: {
    preflight: false,
    animation: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    backgroundBlendMode: false,
    boxDecorationBreak: false,
    divideColor: false,
    divideOpacity: false,
    divideStyle: false,
    divideWidth: false,
    gradientColorStops: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
    space: false,
  },

  // 3. 精简主题配置
  theme: {
    screens: {}, // 禁用响应式断点
    fontSize: {
      xs: ['24rpx', '32rpx'],
      sm: ['28rpx', '40rpx'],
      base: ['32rpx', '48rpx'],
      lg: ['36rpx', '52rpx'],
      xl: ['40rpx', '56rpx'],
    },
    spacing: {
      0: '0',
      1: '8rpx',
      2: '16rpx',
      3: '24rpx',
      4: '32rpx',
      5: '40rpx',
      6: '48rpx',
      8: '64rpx',
      10: '80rpx',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      gray: {
        100: '#f7f7f7',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
      },
      blue: {
        500: '#007AFF',
        600: '#0066CC',
      },
      red: {
        500: '#FF3B30',
      },
      green: {
        500: '#34C759',
      },
      yellow: {
        500: '#FF9500',
      },
    },
    extend: {},
  },

  // 4. 禁用所有变体（variants）
  variants: {},

  plugins: [],
};
