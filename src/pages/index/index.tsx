import { View, Text, Map } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('呱呱车地图页面加载完成')
  })

  // 地图中心点坐标（示例：北京天安门附近）
  const centerLongitude = 116.397128
  const centerLatitude = 39.916527

  // 观光车站点标记
  const markers: any[] = [
    {
      id: 1,
      latitude: 39.916527,
      longitude: 116.397128,
      title: '游客中心',
      iconPath: ''
    },
    {
      id: 2,
      latitude: 39.920527,
      longitude: 116.400128,
      title: '观景台',
      iconPath: ''
    },
    {
      id: 3,
      latitude: 39.924527,
      longitude: 116.403128,
      title: '文化广场',
      iconPath: ''
    }
  ]

  // 路线
  const polyline = [
    {
      points: [
        { latitude: 39.916527, longitude: 116.397128 },
        { latitude: 39.920527, longitude: 116.400128 },
        { latitude: 39.924527, longitude: 116.403128 }
      ],
      color: '#4A90E2',
      width: 4
    }
  ]

  const handleMapTap = () => {
    console.log('地图被点击')
  }

  const handleMarkerTap = (e: any) => {
    console.log('标记点被点击', e.detail)
  }

  const handleMapError = (e: any) => {
    console.log('地图错误', e.detail)
  }

  return (
    <View className='index'>
      <View className='header'>
        <Text className='title'>呱呱车地图路线</Text>
      </View>

      <View className='map-container'>
        <Map
          longitude={centerLongitude}
          latitude={centerLatitude}
          scale={14}
          markers={markers}
          polyline={polyline}
          showLocation={false}
          enableZoom={true}
          enableScroll={true}
          onTap={handleMapTap}
          onMarkerTap={handleMarkerTap}
          onError={handleMapError}
        />
      </View>
    </View>
  )
}
