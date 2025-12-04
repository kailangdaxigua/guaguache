import { View, Text, Map } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";

interface LocationHistory {
  latitude: number;
  longitude: number;
  time: string;
  accuracy?: number;
}

export default function Index() {
  const [longitude, setLongitude] = useState(116.397128);
  const [latitude, setLatitude] = useState(39.916527);
  const [scale, setScale] = useState(14);
  const [, setAccuracy] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const locationChangeHandler = (res: any) => {
      const { latitude, longitude, accuracy } = res;
      setLongitude(longitude);
      setLatitude(latitude);
      if (accuracy) setAccuracy(accuracy);
      console.log("位置更新：", { latitude, longitude, accuracy });
    };

    Taro.onLocationChange(locationChangeHandler);

    return () => {
      Taro.offLocationChange(locationChangeHandler);
    };
  }, []);

  const addToHistory = (lat: number, lon: number, acc?: number) => {
    const newRecord: LocationHistory = {
      latitude: lat,
      longitude: lon,
      time: new Date().toLocaleTimeString("zh-CN"),
      accuracy: acc,
    };
    setLocationHistory((prev) => [newRecord, ...prev.slice(0, 4)]);
  };

  const handleGetLocation = () => {
    Taro.showLoading({ title: "定位中..." });
    Taro.getLocation({
      type: "gcj02",
      isHighAccuracy: true,
      highAccuracyExpireTime: 4000,
      success: (res) => {
        const { latitude, longitude, accuracy, speed } = res;
        setLongitude(longitude);
        setLatitude(latitude);
        setAccuracy(accuracy || null);
        addToHistory(latitude, longitude, accuracy);

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

  const handleZoomIn = () => {
    if (scale < 18) setScale(scale + 2);
  };

  const handleZoomOut = () => {
    if (scale > 5) setScale(scale - 2);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const jumpToHistory = (record: LocationHistory) => {
    setLatitude(record.latitude);
    setLongitude(record.longitude);
    setShowHistory(false);
    Taro.showToast({
      title: "已定位到历史位置",
      icon: "success",
      duration: 1500,
    });
  };

  const handleMapError = (e: any) => {
    console.log("地图错误", e.detail);
  };

  return (
    <View className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 relative">
      <View className="bg-gradient-to-br from-indigo-500 to-purple-600 px-8 pt-10 pb-8 text-center shadow-lg relative">
        <Text className="block mb-2 text-3xl font-bold text-white drop-shadow">
          🚗 呱呱车定位
        </Text>
        <Text className="block text-xl font-light text-white/90">实时位置追踪系统</Text>
      </View>

      <View className="mx-5 my-5 h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-white relative transition-all duration-300">
        <Map
          longitude={longitude}
          latitude={latitude}
          scale={scale}
          showLocation={true}
          onError={handleMapError}
          className="w-full h-full"
        />

        <View className="absolute top-5 right-5 z-10 flex flex-col gap-2.5">
          <View className="flex flex-col gap-2">
            <View
              className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-2xl font-bold text-indigo-500 shadow-md active:scale-95 active:shadow-sm transition"
              onClick={handleZoomIn}
            >
              +
            </View>
            <View
              className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-2xl font-bold text-indigo-500 shadow-md active:scale-95 active:shadow-sm transition"
              onClick={handleZoomOut}
            >
              -
            </View>
          </View>
        </View>
      </View>
      <View className="p-5">
        <View className="grid grid-cols-2 gap-4">
          <View
            className="relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 shadow-md active:translate-y-0.5 active:shadow-sm transition"
            onClick={handleGetLocation}
          >
            <Text className="text-4xl">📍</Text>
            <Text className="text-lg font-semibold text-white">获取定位</Text>
          </View>

          <View
            className="relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-5 shadow-md active:translate-y-0.5 active:shadow-sm transition"
            onClick={handleOpenLocation}
          >
            <Text className="text-4xl">🗺️</Text>
            <Text className="text-lg font-semibold text-white">打开地图</Text>
          </View>

          <View
            className="relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 p-5 shadow-md active:translate-y-0.5 active:shadow-sm transition"
            onClick={toggleHistory}
          >
            <Text className="text-4xl">📜</Text>
            <Text className="text-lg font-semibold text-white">历史记录</Text>
            {locationHistory.length > 0 && (
              <View className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {locationHistory.length}
              </View>
            )}
          </View>
        </View>
      </View>
      {showHistory && (
        <View className="fixed bottom-0 left-0 right-0 max-h-[70vh] bg-white rounded-t-[30px] shadow-2xl z-50 animate-[slideUp_0.3s_ease]">
          <View className="flex items-center justify-between px-8 py-7 border-b-2 border-gray-100">
            <Text className="text-2xl font-bold text-gray-800">定位历史</Text>
            <Text
              className="w-12 h-12 flex items-center justify-center rounded-full text-3xl text-gray-500 active:bg-gray-100"
              onClick={toggleHistory}
            >
              ✕
            </Text>
          </View>
          <View className="px-5 py-4 max-h-[50vh] overflow-y-auto">
            {locationHistory.length === 0 ? (
              <View className="py-16 px-5 text-center">
                <Text className="text-xl text-gray-400">暂无历史记录</Text>
              </View>
            ) : (
              locationHistory.map((record, index) => (
                <View
                  key={index}
                  className="mb-4 last:mb-0 rounded-2xl px-6 py-5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md active:scale-95 transition"
                  onClick={() => jumpToHistory(record)}
                >
                  <View className="flex items-center justify-between mb-2">
                    <Text className="text-base font-medium text-white/90">
                      🕐 {record.time}
                    </Text>
                    {record.accuracy && (
                      <Text className="text-xs font-bold text-green-500 bg-white/90 px-3 py-1 rounded-full">
                        ±{record.accuracy.toFixed(0)}m
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </View>
  );
}
