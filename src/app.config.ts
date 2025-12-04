export default defineAppConfig({
  pages: ["pages/index/index", "pages/profile/index"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "呱呱车",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#7A7E83",
    selectedColor: "#4A90E2",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "assets/icons/home.png",
        selectedIconPath: "assets/icons/home-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/icons/profile.png",
        selectedIconPath: "assets/icons/profile-active.png",
      },
    ],
  },

  // 新增分包配置：后续可在这些目录下新增非核心页面
  subpackages: [
    {
      root: "pages/order",
      pages: ["detail/index", "list/index"],
    },
    {
      root: "pages/marketing",
      pages: ["coupon/index"],
    },
  ],

  requiredBackgroundModes: ["location"], // 开启后台定位
  permission: {
    "scope.userLocation": {
      desc: "用于显示当前位置与地图功能",
    },
  },
});
