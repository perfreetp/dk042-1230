import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import Avatar from '@/components/Avatar'
import Timeline from '@/components/Timeline'
import AppButton from '@/components/AppButton'
import { orders } from '@/data/orders'
import styles from './index.module.scss'

const iconMap: Record<string, string> = {
  check: '🩺',
  medicine: '💊',
  other: '📋'
}

const InServicePage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id
  const order = useMemo(() => orders.find((o) => o.id === id) || orders[0], [id])

  const [checkedIn, setCheckedIn] = useState(true)

  const handleCheckIn = () => {
    if (checkedIn) return
    console.log('[InService] 到院签到')
    Taro.showToast({ title: '签到成功', icon: 'success' })
    setCheckedIn(true)
  }

  const handleContact = () => {
    Taro.showToast({ title: '正在呼叫陪诊员...', icon: 'none' })
  }

  const handleComplete = () => {
    Taro.showModal({
      title: '确认完成',
      content: '确认服务已完成？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '服务已完成', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1500)
        }
      }
    })
  }

  const handleSendText = () => {
    Taro.showToast({ title: '发送消息功能开发中', icon: 'none' })
  }

  const handleSendImage = () => {
    Taro.showToast({ title: '上传照片功能开发中', icon: 'none' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.patientInfo}>
          <Avatar src={order.companionAvatar} name={order.companionName} size="md" />
          <View className={styles.info}>
            <Text className={styles.patientName}>{order.patient.name} · {order.department}</Text>
            <Text className={styles.hospital}>{order.hospital} · {order.appointmentTime}</Text>
          </View>
          <Text className={styles.contactBtn} onClick={handleContact}>联系</Text>
        </View>
        <View className={styles.checkInBar}>
          <Text className={styles.checkInText}>
            {checkedIn ? `✓ 已到院签到（${order.serviceProgress?.[1]?.time || '08:35'}）` : '尚未签到，请到达医院后签到'}
          </Text>
          <Text
            className={classnames(styles.checkInBtn, checkedIn && styles.checked)}
            onClick={handleCheckIn}
          >
            {checkedIn ? '已签到' : '签到'}
          </Text>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        {order.serviceProgress && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>就诊进度</Text>
            <Timeline items={order.serviceProgress} />
          </View>
        )}

        {order.checkReminders && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>检查与用药提醒</Text>
            <View className={styles.reminderList}>
              {order.checkReminders.map((r) => (
                <View key={r.id} className={classnames(styles.reminderItem, styles[r.type])}>
                  <View className={styles.iconBox}>{iconMap[r.type]}</View>
                  <View className={styles.content}>
                    <Text className={styles.title}>{r.title}</Text>
                    <Text className={styles.sub}>
                      预计 {r.time}
                      {r.note ? ` · ${r.note}` : ''}
                    </Text>
                  </View>
                  <Text className={classnames(styles.status, r.completed ? 'done' : 'pending')}>
                    {r.completed ? '已完成' : '待进行'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {order.updates && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>实时消息回传</Text>
            <View className={styles.updateList}>
              {order.updates.map((u) => (
                <View key={u.id} className={styles.updateItem}>
                  <Avatar src={order.companionAvatar} name={order.companionName} size="sm" />
                  <View className={styles.bubble}>
                    <Text className={styles.time}>{order.companionName} · {u.time}</Text>
                    {u.type === 'text' ? (
                      <Text className={styles.text}>{u.content}</Text>
                    ) : (
                      <Image
                        className={styles.image}
                        src={u.content}
                        mode="aspectFill"
                        onError={(e) => console.error('[InService] 图片加载失败', e)}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.inputBar} onClick={handleSendText}>
          <Text>输入消息...</Text>
        </View>
        <AppButton text="照片" type="ghost" size="md" onClick={handleSendImage} />
        <AppButton text="完成服务" type="primary" size="md" onClick={handleComplete} />
      </View>
    </View>
  )
}

export default InServicePage
