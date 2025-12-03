import { View, Text, Map, Button } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function Index() {
  // 地图中心点坐标（默认：北京天安门附近）
  const [longitude, setLongitude] = useState(116.397128);
  const [latitude, setLatitude] = useState(39.916527);

  // 监听位置变化
  useEffect(() => {
    const locationChangeHandler = (res: any) => {
      const { latitude, longitude } = res;
      setLongitude(longitude);
      setLatitude(latitude);
      console.log("位置更新：", { latitude, longitude });
    };

    // 监听位置变化事件
    Taro.onLocationChange(locationChangeHandler);

    // 清理函数
    return () => {
      Taro.offLocationChange(locationChangeHandler);
    };
  }, []);

  // 获取当前位置
  const handleGetLocation = () => {
    Taro.getLocation({
      type: "gcj02", // 返回可以用于 Taro Map 组件的坐标
      isHighAccuracy: true, // 开启高精度定位
      highAccuracyExpireTime: 4000, // 高精度定位超时时间
      success: (res) => {
        const { latitude, longitude, accuracy, speed } = res;
        setLongitude(longitude);
        setLatitude(latitude);
        console.log("定位信息：", {
          latitude,
          longitude,
          accuracy,
          speed,
        });
        Taro.showToast({
          title: "定位成功",
          icon: "success",
          duration: 2000,
        });
      },
      fail: (err) => {
        Taro.showToast({
          title: "获取位置失败",
          icon: "none",
          duration: 2000,
        });
        console.error("获取位置失败：", err);
      },
    });
  };

  // 开启前台接收位置消息
  const handleStartLocationUpdate = () => {
    Taro.startLocationUpdate({
      type: "gcj02",
      needFullAccuracy: true,
      success: () => {
        Taro.showToast({
          title: "已开启位置更新",
          icon: "success",
          duration: 2000,
        });
        console.log("已开启前台位置更新");
      },
      fail: (err) => {
        Taro.showToast({
          title: "开启失败",
          icon: "none",
          duration: 2000,
        });
        console.error("开启位置更新失败：", err);
      },
    });
  };


  // 打开微信内置地图查看位置
  const handleOpenLocation = () => {
    Taro.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 18,
      name: "当前位置",
      address: "呱呱车定位位置",
      success: () => {
        console.log("打开地图成功");
      },
      fail: (err) => {
        console.error("打开地图失败：", err);
      },
    });
  };

  const handleMapError = (e: any) => {
    console.log("地图错误", e.detail);
  };

  return (
    <View className="index">
      <View className="header">
        <Text className="title">呱呱车地图路线</Text>
      </View>

      <View className="map-container">
        <Map
          longitude={longitude}
          latitude={latitude}
          scale={14}
          showLocation={true}
          onError={handleMapError}
        />
      </View>

      <View className="button-container">
        <Button className="location-button" onClick={handleGetLocation}>
          获取当前位置
        </Button>
        <Button className="location-button" onClick={handleStartLocationUpdate}>
          开启位置更新
        </Button>
        <Button className="location-button" onClick={handleOpenLocation}>
          打开地图
        </Button>
      </View>
    </View>
  );
}
