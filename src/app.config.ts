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
  // 关键修正区域：权限配置
  permission: {
    "scope.userLocation": {
      desc: "为了提供实时导航服务，我们需要获取您的当前位置", // 描述尽量具体，否则审核可能不通过
    },
    // 后台定位通常不需要单独在 permission 里写 scope.userLocationBackground，
    // 但需要在 requiredBackgroundModes 里声明
  },
  requiredBackgroundModes: ["location"], // 必须项：开启后台定位
  // 修正：必须声明所有使用的 API，否则调用会失败
  requiredPrivateInfos: [
    "getLocation",
    "onLocationChange",
    "startLocationUpdateBackground",
    "startLocationUpdate",
  ],
});
