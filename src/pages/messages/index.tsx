import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useOrderStore } from '@/store/order'
import type { MessageCategory, Order } from '@/types'
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
  const storeMessages = useOrderStore((s) => s.messages)
  const storeOrders = useOrderStore((s) => s.orders)
  const markMessageRead = useOrderStore((s) => s.markMessageRead)
  const markAllMessagesRead = useOrderStore((s) => s.markAllMessagesRead)

  useDidShow(() => {
    console.log('[Messages] useDidShow, 消息总数:', storeMessages.length, '未读:', storeMessages.filter((m) => !m.read).length)
  })

  const unreadCount = useMemo(() => {
    const counts: Record<string, number> = { all: 0 }
    storeMessages.forEach((m) => {
      if (!m.read) {
        counts.all++
        counts[m.category] = (counts[m.category] || 0) + 1
      }
    })
    return counts
  }, [storeMessages])

  const filteredMessages = useMemo(() => {
    const sorted = [...storeMessages].sort((a, b) => b.time.localeCompare(a.time))
    if (activeTab === 'all') return sorted
    return sorted.filter((m) => m.category === activeTab)
  }, [activeTab, storeMessages])

  const getOrderForMsg = (orderId?: string): Order | undefined => {
    if (!orderId) return undefined
    return storeOrders.find((o) => o.id === orderId)
  }

  const handleClick = (msg: typeof storeMessages[0]) => {
    console.log('[Messages] 点击消息:', msg.id, 'orderId:', msg.orderId)
    markMessageRead(msg.id)
    if (msg.orderId) {
      const order = getOrderForMsg(msg.orderId)
      if (order && order.status === 'in_service') {
        Taro.navigateTo({ url: `/pages/in-service/index?id=${msg.orderId}` })
      } else {
        Taro.navigateTo({ url: `/pages/order-detail/index?id=${msg.orderId}` })
      }
    }
  }

  const handleMarkAll = () => {
    if (unreadCount.all === 0) {
      Taro.showToast({ title: '暂无未读消息', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '全部标为已读',
      content: `确认将 ${unreadCount.all} 条未读消息全部标为已读？`,
      success: (res) => {
        if (res.confirm) {
          markAllMessagesRead()
          Taro.showToast({ title: '已全部标记', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>消息中心</Text>
        <Text className={styles.markAll} onClick={handleMarkAll}>
          全部已读
        </Text>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            {unreadCount[tab.key] > 0 && (
              <View className={styles.badge}>
                {unreadCount[tab.key] > 99 ? '99+' : unreadCount[tab.key]}
              </View>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.messageList}>
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => {
              const order = getOrderForMsg(msg.orderId)
              return (
                <View
                  key={msg.id}
                  className={classnames(styles.messageCard, styles[msg.category], !msg.read && styles.unreadCard)}
                  onClick={() => handleClick(msg)}
                >
                  <View className={styles.cardHeader}>
                    <View className={styles.iconBox}>{iconMap[msg.category]}</View>
                    <View className={styles.headerContent}>
                      <View className={styles.titleRow}>
                        <Text className={styles.title}>{msg.title}</Text>
                        {!msg.read && <View className={styles.unreadDot} />}
                      </View>
                      <Text className={styles.time}>{msg.time}</Text>
                    </View>
                    <Text className={styles.arrow}>›</Text>
                  </View>
                  <View className={styles.cardBody}>
                    <Text className={styles.content}>{msg.content}</Text>
                    {order && (
                      <View className={styles.orderBrief}>
                        <View className={styles.orderBriefAvatar}>
                          <Text className={styles.orderBriefInitial}>
                            {order.companionName.slice(0, 1)}
                          </Text>
                        </View>
                        <View className={styles.orderBriefInfo}>
                          <Text className={styles.orderBriefMain}>
                            {order.hospital} · {order.department}
                          </Text>
                          <Text className={styles.orderBriefSub}>
                            就诊人{order.patient.name} · {order.appointmentDate} {order.appointmentTime}
                          </Text>
                        </View>
                        <Text className={styles.orderBriefTag}>
                          {order.status === 'in_service' ? '查看进展' : '查看订单'}
                        </Text>
                      </View>
                    )}
                    {msg.extra && Object.keys(msg.extra).length > 0 && (
                      <View className={styles.extraBox}>
                        {Object.entries(msg.extra).map(([k, v]) => (
                          <View key={k} className={styles.extraItem}>
                            <Text className={styles.extraKey}>
                              {k === 'diagnosis'
                                ? '诊断'
                                : k === 'suggestion'
                                ? '建议'
                                : k === 'nextVisit'
                                ? '复诊'
                                : k === 'waiting'
                                ? '等候'
                                : k === 'medicines'
                                ? '用药'
                                : k}
                              ：
                            </Text>
                            <Text className={styles.extraValue}>
                              {Array.isArray(v)
                                ? v.map((m) => `${m.name} ${m.dosage} ${m.frequency}`).join('；')
                                : String(v)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )
            })
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无「{tabs.find((t) => t.key === activeTab)?.label}」消息</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default MessagesPage
