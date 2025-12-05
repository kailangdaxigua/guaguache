// 导入 Taro 组件
import { View, Text, Map } from "@tarojs/components";
// 导入 React Hooks
import { useState, useEffect } from "react";
// 导入 Taro API
import Taro from "@tarojs/taro";

// 定位页面主组件
export default function Index() {
  // 经度状态，默认位置
  const [longitude, setLongitude] = useState(114.52208);
  // 纬度状态，默认位置
  const [latitude, setLatitude] = useState(30.714933);
  // 地图缩放级别，固定为 14
  const scale = 14;
  // 定位精度（未使用，保留用于扩展）
  const [, setAccuracy] = useState<number | null>(null);

  // 监听位置变化
  useEffect(() => {
    // 位置变化回调处理函数
    const locationChangeHandler = (res: any) => {
      const { latitude, longitude, accuracy } = res;
      setLongitude(longitude);
      setLatitude(latitude);
      if (accuracy) setAccuracy(accuracy);
      console.log("位置更新：", { latitude, longitude, accuracy });
    };

    // 注册位置变化监听
    Taro.onLocationChange(locationChangeHandler);

    // 组件卸载时移除监听
    return () => {
      Taro.offLocationChange(locationChangeHandler);
    };
  }, []);

  // 获取当前位置
  const handleGetLocation = () => {
    Taro.showLoading({ title: "定位中..." });
    Taro.getLocation({
      type: "gcj02", // 使用国测局坐标系
      isHighAccuracy: true, // 启用高精度定位
      highAccuracyExpireTime: 4000, // 高精度定位超时时间
      success: (res) => {
        const { latitude, longitude, accuracy, speed } = res;
        // 更新地图位置
        setLongitude(longitude);
        setLatitude(latitude);
        setAccuracy(accuracy || null);

        Taro.hideLoading();
        Taro.showToast({
          title: "定位成功",
          icon: "success",
          duration: 2000,
        });
        console.log("定位信息：", { latitude, longitude, accuracy, speed });
      },
      fail: (err) => {
        Taro.hideLoading();
        Taro.showToast({
          title: "定位失败",
          icon: "error",
          duration: 2000,
        });
        console.error("获取位置失败：", err);
      },
    });
  };

  // 地图错误处理
  const handleMapError = (e: any) => {
    console.log("地图错误", e.detail);
  };

  return (
    <View className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 relative">
      {/* 页面头部标题区域 */}
      <View className="bg-gradient-to-br from-indigo-500 to-purple-600 px-8 pt-6 pb-4 text-center shadow-lg relative">
        <Text className="block mb-1 text-lg font-bold text-white drop-shadow">
          🚗 呱呱车定位
        </Text>
        <Text className="block text-sm font-light text-white/90">实时位置追踪系统</Text>
      </View>

      {/* 地图容器 */}
      <View className="mx-5 my-3 h-[650px] rounded-2xl overflow-hidden shadow-2xl bg-white relative transition-all duration-300">
        {/* 地图组件 */}
        <Map
          longitude={longitude}
          latitude={latitude}
          scale={scale}
          showLocation={true}
          onError={handleMapError}
          className="w-full h-full"
        />
      </View>
      {/* 操作按钮区域 */}
      <View className="p-5">
        <View className="flex justify-center">
          {/* 获取定位按钮 */}
          <View
            className="relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 shadow-md active:translate-y-0.5 active:shadow-sm transition"
            onClick={handleGetLocation}
          >
            <Text className="text-4xl">📍</Text>
            <Text className="text-lg font-semibold text-white">获取定位</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
