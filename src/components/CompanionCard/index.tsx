import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Avatar from '../Avatar'
import Tag from '../Tag'
import styles from './index.module.scss'
import type { Companion } from '@/types'

interface CompanionCardProps {
  data: Companion
  onClick?: () => void
}

const CompanionCard: React.FC<CompanionCardProps> = ({ data, onClick }) => {
  const handleClick = () => {
    onClick?.()
    if (!onClick) {
      Taro.navigateTo({
        url: `/pages/companion-detail/index?id=${data.id}`
      })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Avatar src={data.avatar} name={data.name} size="lg" />
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{data.name}</Text>
            <Text className={styles.age}>{data.gender === 'female' ? '女' : '男'} · {data.age}岁</Text>
          </View>
          <View className={styles.ratingRow}>
            <Text className={styles.rating}>★ {data.rating}</Text>
            <Text className={styles.review}>{data.reviewCount}条评价</Text>
            <Text className={styles.orderCount}>服务{data.orderCount}次</Text>
          </View>
          <View className={styles.expRow}>
            <Text className={styles.exp}>从业{data.experience}年</Text>
          </View>
        </View>
        <View className={styles.priceBlock}>
          <Text className={styles.priceSymbol}>¥</Text>
          <Text className={styles.price}>{data.pricePerHour}</Text>
          <Text className={styles.priceUnit}>/小时</Text>
        </View>
      </View>

      <View className={styles.tags}>
        {data.tags.slice(0, 3).map((tag, idx) => (
          <Tag
            key={`t-${idx}`}
            text={tag}
            type={idx === 0 ? 'secondary' : 'primary'}
            size="sm"
          />
        ))}
        {data.certifications.slice(0, 2).map((cert, idx) => (
          <Tag
            key={`c-${idx}`}
            text={cert}
            type="info"
            size="sm"
            outline
          />
        ))}
      </View>

      <View className={styles.slotRow}>
        <Text className={styles.slotLabel}>今日可约：</Text>
        <View className={styles.slotList}>
          {data.availableSlots.map((slot) => (
            <Text key={slot} className={styles.slotItem}>{slot}</Text>
          ))}
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>服务区域：</Text>
          <Text className={styles.footerValue}>{data.serviceArea.join('、')}</Text>
        </View>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>擅长医院：</Text>
          <Text className={styles.footerValue}>{data.hospitals.slice(0, 2).join('、')}</Text>
        </View>
      </View>
    </View>
  )
}

export default CompanionCard
