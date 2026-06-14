import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { messages } from '@/data/messages'
import type { MessageCategory } from '@/types'
import styles from './index.module.scss'

const tabs: { key: 'all' | MessageCategory; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'trip', label: '行程', icon: '🚗' },
  { key: 'doctor', label: '医嘱', icon: '💊' },
  { key: 'medicine', label: '用药', icon: '💉' },
  { key: 'followup', label: '复诊', icon: '📅' },
  { key: 'system', label: '系统', icon: '🔔' }
]

const iconMap: Record<MessageCategory, string> = {
  trip: '🚗',
  doctor: '💊',
  medicine: '💉',
  followup: '📅',
  system: '🔔'
}

const MessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | MessageCategory>('all')

  const unreadCount = useMemo(() => {
    const counts: Record<string, number> = { all: 0 }
    messages.forEach((m) => {
      if (!m.read) {
        counts.all++
        counts[m.category] = (counts[m.category] || 0) + 1
      }
    })
    return counts
  }, [])

  const filteredMessages = useMemo(() => {
    if (activeTab === 'all') return messages
    return messages.filter((m) => m.category === activeTab)
  }, [activeTab])

  const handleClick = (msg: typeof messages[0]) => {
    console.log('[Messages] 点击消息:', msg.id)
    if (msg.orderId) {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${msg.orderId}` })
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            {unreadCount[tab.key] > 0 && (
              <View className={styles.badge}>{unreadCount[tab.key]}</View>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.messageList}>
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <View
                key={msg.id}
                className={classnames(styles.messageCard, styles[msg.category])}
                onClick={() => handleClick(msg)}
              >
                <View className={styles.cardHeader}>
                  <View className={styles.iconBox}>{iconMap[msg.category]}</View>
                  <View className={styles.headerContent}>
                    <Text className={styles.title}>{msg.title}</Text>
                    <Text className={styles.time}>{msg.time}</Text>
                  </View>
                  {!msg.read && <View className={styles.unreadDot} />}
                </View>
                <View className={styles.cardBody}>
                  <Text className={styles.content}>{msg.content}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无消息</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default MessagesPage
