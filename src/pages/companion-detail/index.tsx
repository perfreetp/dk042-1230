import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import Avatar from '@/components/Avatar'
import Tag from '@/components/Tag'
import AppButton from '@/components/AppButton'
import { companions } from '@/data/companions'
import styles from './index.module.scss'

const CompanionDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id

  const companion = useMemo(() => companions.find((c) => c.id === id) || companions[0], [id])

  const handleBook = () => {
    console.log('[CompanionDetail] 预约陪诊员:', companion.id)
    Taro.navigateTo({ url: `/pages/booking/index?companionId=${companion.id}` })
  }

  const handleContact = () => {
    Taro.showToast({ title: '联系功能开发中', icon: 'none' })
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.header}>
          <View className={styles.top}>
            <Avatar src={companion.avatar} name={companion.name} size="lg" />
            <View className={styles.info}>
              <Text className={styles.name}>{companion.name}</Text>
              <Text className={styles.meta}>
                {companion.gender === 'female' ? '女' : '男'} · {companion.age}岁 · 从业{companion.experience}年
              </Text>
              <View className={styles.rating}>
                <Text className={styles.stars}>★★★★★</Text>
                <Text className={styles.ratingText}>{companion.rating}分 · {companion.reviewCount}条评价</Text>
              </View>
            </View>
          </View>
          <View className={styles.tagRow}>
            {companion.tags.map((tag, idx) => (
              <Tag
                key={idx}
                text={tag}
                type={idx === 0 ? 'secondary' : 'primary'}
                size="md"
              />
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>服务信息</Text>
          <View className={styles.row}>
            <Text className={styles.label}>服务区域</Text>
            <Text className={styles.value}>{companion.serviceArea.join('、')}</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>擅长医院</Text>
            <Text className={styles.value}>{companion.hospitals.join('、')}</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>擅长科室</Text>
            <Text className={styles.value}>{companion.departments.join('、')}</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>服务次数</Text>
            <Text className={styles.value}>{companion.orderCount}次</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>个人介绍</Text>
          <Text className={styles.introText}>{companion.serviceIntro}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>资质证书</Text>
          <View className={styles.certList}>
            {companion.certifications.map((cert, idx) => (
              <Tag key={idx} text={`✓ ${cert}`} type="success" size="md" />
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>可约时段</Text>
          <View className={styles.row}>
            <Text className={styles.label}>可约日期</Text>
            <Text className={styles.value}>{companion.availableDates.join('、')}</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>可约时段</Text>
            <Text className={styles.value}>{companion.availableSlots.join(' / ')}</Text>
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.price}>
          <Text className={styles.priceLabel}>服务价格</Text>
          <View>
            <Text className={styles.priceValue}>¥{companion.pricePerHour}</Text>
            <Text style={{ fontSize: 24, color: '#86909C' }}>/小时</Text>
          </View>
        </View>
        <AppButton text="联系TA" type="outline" size="lg" onClick={handleContact} />
        <AppButton text="立即预约" type="primary" size="lg" onClick={handleBook} />
      </View>
    </View>
  )
}

export default CompanionDetailPage
