import React, { useState, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Image, Textarea } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import Avatar from '@/components/Avatar'
import Timeline from '@/components/Timeline'
import AppButton from '@/components/AppButton'
import { useOrderStore } from '@/store/order'
import type { ServiceProgress, CheckReminder } from '@/types'
import styles from './index.module.scss'

const iconMap: Record<string, string> = {
  check: '🩺',
  medicine: '💊',
  other: '📋'
}

const genId = () => `u${Date.now()}${Math.floor(Math.random() * 1000)}`
const timeStr = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const InServicePage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id || ''

  const getOrder = useOrderStore((s) => s.getOrder)
  const storeOrders = useOrderStore((s) => s.orders)
  const addServiceUpdate = useOrderStore((s) => s.addServiceUpdate)
  const completeService = useOrderStore((s) => s.completeService)
  const updateOrder = useOrderStore((s) => s.updateOrder)

  const order = useMemo(() => getOrder(id) || storeOrders.find((o) => o.status === 'in_service') || storeOrders[0], [id, getOrder, storeOrders])

  const [inputText, setInputText] = useState('')
  const [checkedIn, setCheckedIn] = useState(true)
  const [progressItems, setProgressItems] = useState<ServiceProgress[]>(order?.serviceProgress || [])
  const [reminders, setReminders] = useState<CheckReminder[]>(order?.checkReminders || [])
  const scrollRef = useRef<any>(null)

  useDidShow(() => {
    if (order) {
      setProgressItems(order.serviceProgress || [])
      setReminders(order.checkReminders || [])
    }
  })

  const handleCheckIn = () => {
    if (checkedIn) return
    console.log('[InService] 到院签到')
    const now = timeStr()
    const updated: ServiceProgress[] = progressItems.map((p, idx) => {
      if (idx === 0) return { ...p, status: 'done' as const, time: now, description: '陪诊员已到达医院等候' }
      if (idx === 1) return { ...p, status: 'current' as const, time: now }
      return p
    })
    setProgressItems(updated)
    updateOrder(order.id, { serviceProgress: updated })
    addServiceUpdate(order.id, { type: 'text', content: `陪诊员于${now}到达医院，已完成签到` })
    setCheckedIn(true)
    Taro.showToast({ title: '签到成功', icon: 'success' })
  }

  const handleContact = () => {
    Taro.showToast({ title: '正在呼叫陪诊员...', icon: 'none' })
  }

  const handleComplete = () => {
    Taro.showModal({
      title: '确认完成服务',
      content: '确认所有就诊流程已完成？完成后订单将自动进入"已完成"状态，您可以评价陪诊服务并申请发票。',
      success: (res) => {
        if (res.confirm) {
          completeService(order.id)
          addServiceUpdate(order.id, { type: 'text', content: '本次陪诊服务已全部完成，祝您早日康复！' })
          Taro.showToast({ title: '服务已完成', icon: 'success' })
          setTimeout(() => {
            Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` })
          }, 1500)
        }
      }
    })
  }

  const handleSendText = () => {
    const text = inputText.trim()
    if (!text) {
      Taro.showToast({ title: '请输入消息内容', icon: 'none' })
      return
    }
    addServiceUpdate(order.id, { type: 'text', content: text })
    setInputText('')
    setTimeout(() => {
      scrollRef.current?.scrollToOffset({ offset: 999999, animated: true })
    }, 100)
  }

  const handleSendImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        const imgUrl = tempFilePaths[0] || `https://picsum.photos/id/${400 + Math.floor(Math.random() * 100)}/600/400`
        addServiceUpdate(order.id, { type: 'image', content: imgUrl })
        Taro.showToast({ title: '照片已上传', icon: 'success' })
        setTimeout(() => {
          scrollRef.current?.scrollToOffset({ offset: 999999, animated: true })
        }, 100)
      },
      fail: () => {
        const fallback = `https://picsum.photos/id/${400 + Math.floor(Math.random() * 100)}/600/400`
        addServiceUpdate(order.id, { type: 'image', content: fallback })
        Taro.showToast({ title: '照片已上传', icon: 'success' })
        setTimeout(() => {
          scrollRef.current?.scrollToOffset({ offset: 999999, animated: true })
        }, 100)
      }
    })
  }

  const handleToggleReminder = (rid: string) => {
    const updated = reminders.map((r) =>
      r.id === rid ? { ...r, completed: !r.completed } : r
    )
    setReminders(updated)
    updateOrder(order.id, { checkReminders: updated })
    const target = reminders.find((r) => r.id === rid)
    if (target) {
      addServiceUpdate(order.id, {
        type: 'text',
        content: `${target.completed ? '⚠️ 重新提醒：' : '✅ 已完成：'}${target.title}`
      })
    }
  }

  const handleAdvanceProgress = () => {
    const updated = [...progressItems]
    let advanced = false
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'pending') {
        if (i > 0) updated[i - 1] = { ...updated[i - 1], status: 'done', time: timeStr() }
        updated[i] = { ...updated[i], status: 'current', time: timeStr() }
        advanced = true
        addServiceUpdate(order.id, {
          type: 'text',
          content: `【就诊进展】进入「${updated[i].title}」环节：${updated[i].description}`
        })
        break
      }
    }
    if (!advanced && updated.length > 0 && updated[updated.length - 1].status !== 'done') {
      updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'done', time: timeStr() }
      advanced = true
    }
    if (advanced) {
      setProgressItems(updated)
      updateOrder(order.id, { serviceProgress: updated })
    } else {
      Taro.showToast({ title: '已是最后环节', icon: 'none' })
    }
  }

  if (!order) {
    return (
      <View style={{ padding: 100, textAlign: 'center', color: '#86909C' }}>
        <Text>订单不存在</Text>
      </View>
    )
  }

  const currentUpdates = order.updates || []

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
            {checkedIn
              ? `✓ 已到院签到（${order.serviceProgress?.[1]?.time || timeStr()}）`
              : '尚未签到，请到达医院后签到'}
          </Text>
          <Text
            className={classnames(styles.checkInBtn, checkedIn && styles.checked)}
            onClick={handleCheckIn}
          >
            {checkedIn ? '已签到' : '签到'}
          </Text>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false} ref={scrollRef} scrollWithAnimation>
        {progressItems.length > 0 && (
          <View className={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text className={styles.sectionTitle}>就诊进度</Text>
              <Text
                className={styles.advanceBtn}
                onClick={handleAdvanceProgress}
              >
                → 推进到下一环
              </Text>
            </View>
            <Timeline items={progressItems} />
          </View>
        )}

        {reminders.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>检查与用药提醒</Text>
            <View className={styles.reminderList}>
              {reminders.map((r) => (
                <View
                  key={r.id}
                  className={classnames(styles.reminderItem, styles[r.type], r.completed && styles.completed)}
                  onClick={() => handleToggleReminder(r.id)}
                >
                  <View className={styles.iconBox}>{iconMap[r.type]}</View>
                  <View className={styles.content}>
                    <Text className={styles.title}>{r.title}</Text>
                    <Text className={styles.sub}>
                      预计 {r.time}
                      {r.note ? ` · ${r.note}` : ''}
                    </Text>
                  </View>
                  <Text className={classnames(styles.status, r.completed ? 'done' : 'pending')}>
                    {r.completed ? '✓ 已完成' : '点击完成'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text className={styles.sectionTitle}>实时消息回传</Text>
            <Text className={styles.updateCount}>共 {currentUpdates.length} 条</Text>
          </View>
          {currentUpdates.length > 0 ? (
            <View className={styles.updateList}>
              {currentUpdates.map((u) => (
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
                        mode="widthFix"
                        onError={(e) => console.error('[InService] 图片加载失败', e)}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 26, color: '#86909C', textAlign: 'center', padding: 40 }}>
              暂无消息，服务开始后陪诊员会实时反馈就诊进展
            </Text>
          )}
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <Textarea
          className={styles.inputBar}
          placeholder="输入消息给家属..."
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          confirmType="send"
          onConfirm={handleSendText}
        />
        <AppButton text="照片" type="ghost" size="md" onClick={handleSendImage} />
        <AppButton text="发送" type="outline" size="md" onClick={handleSendText} />
        <AppButton text="完成服务" type="primary" size="md" onClick={handleComplete} />
      </View>
    </View>
  )
}

export default InServicePage
