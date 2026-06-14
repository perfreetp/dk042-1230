import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Avatar from '@/components/Avatar'
import styles from './index.module.scss'

const menuGroups = [
  {
    title: '订单服务',
    items: [
      { icon: '👥', label: '就诊人管理', color: '#E8F7EF' },
      { icon: '📄', label: '我的发票', color: '#FFF2E8' },
      { icon: '⭐', label: '我的评价', color: '#E8F0FF' }
    ]
  },
  {
    title: '其他',
    items: [
      { icon: '📞', label: '联系客服', color: 'rgba(0,180,42,0.1)' },
      { icon: '⚙️', label: '设置', color: '#F2F3F5' },
      { icon: '❓', label: '帮助中心', color: 'rgba(255,125,0,0.1)' }
    ]
  }
]

const MinePage: React.FC = () => {
  const handleMenu = (label: string) => {
    console.log('[Mine] 点击菜单:', label)
    Taro.showToast({ title: `${label}功能开发中`, icon: 'none' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userRow}>
          <Avatar name="用户" size="lg" />
          <View className={styles.userInfo}>
            <Text className={styles.name}>张先生</Text>
            <Text className={styles.phone}>138****8888</Text>
          </View>
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>5</Text>
            <Text className={styles.statLabel}>全部订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>1</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>2</Text>
            <Text className={styles.statLabel}>待评价</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>3</Text>
            <Text className={styles.statLabel}>收藏陪诊</Text>
          </View>
        </View>
      </View>

      {menuGroups.map((group) => (
        <View key={group.title} className={styles.section}>
          <Text className={styles.sectionTitle}>{group.title}</Text>
          {group.items.map((item) => (
            <View key={item.label} className={styles.menuItem} onClick={() => handleMenu(item.label)}>
              <View className={styles.menuIcon} style={{ background: item.color }}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuLabel}>{item.label}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

export default MinePage
