import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import CompanionCard from '@/components/CompanionCard'
import FilterBar from '@/components/FilterBar'
import Tag from '@/components/Tag'
import { companions, hospitals, departments } from '@/data/companions'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string>>({
    hospital: 'all',
    department: 'all',
    date: 'all'
  })

  const [keyword, setKeyword] = useState('')

  const dates = [
    { label: '今天', value: '2026-06-14' },
    { label: '明天', value: '2026-06-15' },
    { label: '后天', value: '2026-06-16' },
    { label: '本周', value: 'week' }
  ]

  const filterConfig = [
    {
      key: 'hospital',
      label: '医院',
      options: [
        { label: '全部', value: 'all' },
        ...hospitals.map((h) => ({ label: h.name, value: h.name }))
      ]
    },
    {
      key: 'department',
      label: '科室',
      options: [
        { label: '全部', value: 'all' },
        ...departments.map((d) => ({ label: d.name, value: d.name }))
      ]
    },
    {
      key: 'date',
      label: '日期',
      options: [
        { label: '不限', value: 'all' },
        ...dates.map((d) => ({ label: d.label, value: d.value }))
      ]
    }
  ]

  const filteredCompanions = useMemo(() => {
    return companions.filter((c) => {
      if (filters.hospital !== 'all' && !c.hospitals.includes(filters.hospital)) return false
      if (filters.department !== 'all' && !c.departments.includes(filters.department)) return false
      if (filters.date !== 'all' && filters.date !== 'week' && !c.availableDates.includes(filters.date)) return false
      if (keyword && !c.name.includes(keyword) && !c.tags.some((t) => t.includes(keyword))) return false
      return true
    })
  }, [filters, keyword])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    console.log('[Home] 筛选条件变更:', key, value)
  }

  const handleSearch = () => {
    Taro.showToast({ title: '搜索功能开发中', icon: 'none' })
  }

  useDidShow(() => {
    console.log('[Home] 页面显示')
  })

  return (
    <View className={styles.page}>
      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.header}>
          <Text className={styles.greeting}>您好，欢迎使用</Text>
          <Text className={styles.title}>为您找到靠谱陪诊</Text>
          <View className={styles.searchBar} onClick={handleSearch}>
            <Text className={styles.icon}>🔍</Text>
            <Text className={styles.placeholder}>搜索陪诊员姓名、标签...</Text>
          </View>
        </View>

        <View className={styles.quickEntry}>
          <View className={styles.entryList}>
            <View className={styles.entryItem} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
              <View className={styles.iconBox}>📋</View>
              <Text className={styles.entryLabel}>我的订单</Text>
            </View>
            <View className={styles.entryItem} onClick={() => Taro.switchTab({ url: '/pages/messages/index' })}>
              <View className={styles.iconBox}>💬</View>
              <Text className={styles.entryLabel}>家属消息</Text>
            </View>
            <View className={styles.entryItem}>
              <View className={styles.iconBox}>🏥</View>
              <Text className={styles.entryLabel}>医院导航</Text>
            </View>
            <View className={styles.entryItem} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
              <View className={styles.iconBox}>👤</View>
              <Text className={styles.entryLabel}>个人中心</Text>
            </View>
          </View>
        </View>

        <View className={styles.banner}>
          <View className={styles.bannerCard}>
            <Text className={styles.bannerTitle}>专业陪诊 · 贴心守护</Text>
            <Text className={styles.bannerDesc}>医护背景陪诊员，全程陪同就医，家属实时查看进展</Text>
            <View className={styles.bannerBtn}>立即预约陪诊</View>
          </View>
        </View>

        <View className={styles.section}>
          <FilterBar
            filters={filterConfig}
            activeFilters={filters}
            onChange={handleFilterChange}
          />
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>推荐陪诊员</Text>
            <Text className={styles.sectionMore}>共 {filteredCompanions.length} 位</Text>
          </View>

          {filteredCompanions.length > 0 ? (
            filteredCompanions.map((c) => <CompanionCard key={c.id} data={c} />)
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无符合条件的陪诊员</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default HomePage
