import { View, Text, Map } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

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
  const [accuracy, setAccuracy] = useState<number | null>(null);
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
    <View className="index">
      <View className="header">
        <Text className="title">🚗 呱呱车定位</Text>
        <Text className="subtitle">实时位置追踪系统</Text>
      </View>

      <View className="map-container">
        <Map
          longitude={longitude}
          latitude={latitude}
          scale={scale}
          showLocation={true}
          onError={handleMapError}
          className="map"
        />

        <View className="map-controls">
          <View className="zoom-controls">
            <View className="control-btn zoom-in" onClick={handleZoomIn}>
              +
            </View>
            <View className="control-btn zoom-out" onClick={handleZoomOut}>
              -
            </View>
          </View>
        </View>
      </View>

      <View className="action-section">
        <View className="button-grid">
          <View className="action-btn primary" onClick={handleGetLocation}>
            <Text className="btn-icon">📍</Text>
            <Text className="btn-text">获取定位</Text>
          </View>

          <View className="action-btn secondary" onClick={handleOpenLocation}>
            <Text className="btn-icon">🗺️</Text>
            <Text className="btn-text">打开地图</Text>
          </View>

          <View className="action-btn tertiary" onClick={toggleHistory}>
            <Text className="btn-icon">📜</Text>
            <Text className="btn-text">历史记录</Text>
            {locationHistory.length > 0 && (
              <View className="badge">{locationHistory.length}</View>
            )}
          </View>

        </View>
      </View>

      {showHistory && (
        <View className="history-panel">
          <View className="history-header">
            <Text className="history-title">定位历史</Text>
            <Text className="history-close" onClick={toggleHistory}>
              ✕
            </Text>
          </View>
          <View className="history-list">
            {locationHistory.length === 0 ? (
              <View className="empty-history">
                <Text className="empty-text">暂无历史记录</Text>
              </View>
            ) : (
              locationHistory.map((record, index) => (
                <View
                  key={index}
                  className="history-item"
                  onClick={() => jumpToHistory(record)}
                >
                  <View className="history-item-header">
                    <Text className="history-time">🕐 {record.time}</Text>
                    {record.accuracy && (
                      <Text className="history-accuracy">
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
