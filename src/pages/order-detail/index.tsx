import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input, Picker, Textarea } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import Avatar from '@/components/Avatar'
import AppButton from '@/components/AppButton'
import Tag from '@/components/Tag'
import StatusBadge from '@/components/StatusBadge'
import { useOrderStore } from '@/store/order'
import type { OrderStatus, InvoiceStatus } from '@/types'
import styles from './index.module.scss'

const statusTextMap: Record<string, { text: string; desc: string }> = {
  pending: { text: '待支付', desc: '请尽快完成支付，超时订单将自动取消' },
  confirmed: { text: '待服务', desc: '陪诊员将在就诊当天提前到达集合地点' },
  in_service: { text: '服务进行中', desc: '陪诊员正在陪同就诊，可查看实时进展' },
  completed: { text: '服务已完成', desc: '感谢您的使用，欢迎评价陪诊服务' },
  cancelled: { text: '订单已取消', desc: '如有疑问请联系客服' },
  refunded: { text: '已退款', desc: '退款已原路退回' }
}

const invoiceStatusText: Record<InvoiceStatus, string> = {
  none: '未申请',
  pending: '开票中（1-3个工作日内发送邮箱）',
  issued: '已开票'
}

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00']

const OrderDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id || ''
  const initialAction = router.params.action

  const getOrder = useOrderStore((s) => s.getOrder)
  const storeOrders = useOrderStore((s) => s.orders)
  const cancelOrder = useOrderStore((s) => s.cancelOrder)
  const rescheduleOrder = useOrderStore((s) => s.rescheduleOrder)
  const supplementInfo = useOrderStore((s) => s.supplementInfo)
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)

  const order = useMemo(() => getOrder(id) || storeOrders[0], [id, getOrder, storeOrders])
  const statusInfo = order ? statusTextMap[order.status] : null

  const [showReschedule, setShowReschedule] = useState(false)
  const [newDate, setNewDate] = useState(order?.appointmentDate || '2026-06-15')
  const [newTime, setNewTime] = useState(order?.appointmentTime || '09:00')

  const [showSupplement, setShowSupplement] = useState(false)
  const [healthNotes, setHealthNotes] = useState('')
  const [idCard, setIdCard] = useState('')
  const [extraNotes, setExtraNotes] = useState('')

  useEffect(() => {
    if (order) {
      setNewDate(order.appointmentDate)
      setNewTime(order.appointmentTime)
    }
  }, [order?.id, order?.appointmentDate, order?.appointmentTime])

  useDidShow(() => {
    if (initialAction === 'reschedule') setShowReschedule(true)
    if (initialAction === 'supplement') setShowSupplement(true)
  })

  if (!order || !statusInfo) {
    return (
      <View style={{ padding: 100, textAlign: 'center', color: '#86909C' }}>
        <Text>订单不存在</Text>
      </View>
    )
  }

  const handleContact = () => Taro.showToast({ title: '正在呼叫陪诊员...', icon: 'none' })
  const handleReschedule = () => setShowReschedule(true)
  const handleSupplement = () => setShowSupplement(true)

  const handleConfirmReschedule = () => {
    if (!newDate || !newTime) {
      Taro.showToast({ title: '请选择新的就诊时间', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认改期',
      content: `将预约时间改为 ${newDate} ${newTime}？`,
      success: (res) => {
        if (res.confirm) {
          rescheduleOrder(order.id, newDate, newTime)
          Taro.showToast({ title: '改期成功', icon: 'success' })
          setShowReschedule(false)
        }
      }
    })
  }

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？已支付金额将在1-3个工作日原路退回。',
      success: (res) => {
        if (res.confirm) {
          cancelOrder(order.id)
          Taro.showToast({ title: '取消成功', icon: 'success' })
        }
      }
    })
  }

  const handlePay = () => {
    updateOrderStatus(order.id, 'confirmed')
    Taro.showToast({ title: '支付成功', icon: 'success' })
  }

  const handleConfirmSupplement = () => {
    if (!healthNotes && !idCard && !extraNotes) {
      Taro.showToast({ title: '请填写补充资料', icon: 'none' })
      return
    }
    supplementInfo(order.id, {
      healthNotes: healthNotes || undefined,
      idCard: idCard || undefined,
      extraNotes: extraNotes || undefined
    })
    Taro.showToast({ title: '资料已提交', icon: 'success' })
    setShowSupplement(false)
    setHealthNotes('')
    setIdCard('')
    setExtraNotes('')
  }

  const handleService = () => Taro.navigateTo({ url: `/pages/in-service/index?id=${order.id}` })
  const handleReview = () => Taro.navigateTo({ url: `/pages/review/index?id=${order.id}` })
  const handleInvoice = () => Taro.navigateTo({ url: `/pages/invoice/index?orderId=${order.id}` })
  const handleStart = () => {
    updateOrderStatus(order.id, 'in_service')
    Taro.showToast({ title: '服务开始', icon: 'success' })
  }

  const renderActions = () => {
    const btns: React.ReactNode[] = []
    if (order.status === 'pending') {
      btns.push(<AppButton key="cancel" text="取消订单" type="ghost" size="lg" onClick={handleCancel} />)
      btns.push(<AppButton key="pay" text="立即支付" type="primary" size="lg" onClick={handlePay} />)
    } else if (order.status === 'confirmed') {
      btns.push(<AppButton key="supplement" text="补充资料" type="ghost" size="lg" onClick={handleSupplement} />)
      btns.push(<AppButton key="cancel" text="取消订单" type="ghost" size="lg" onClick={handleCancel} />)
      btns.push(<AppButton key="reschedule" text="申请改期" type="outline" size="lg" onClick={handleReschedule} />)
      btns.push(<AppButton key="start" text="开始服务" type="primary" size="lg" onClick={handleStart} />)
    } else if (order.status === 'in_service') {
      btns.push(<AppButton key="supplement" text="补充资料" type="outline" size="lg" onClick={handleSupplement} />)
      btns.push(<AppButton key="contact" text="联系陪诊员" type="outline" size="lg" onClick={handleContact} />)
      btns.push(<AppButton key="view" text="查看进展" type="primary" size="lg" onClick={handleService} />)
    } else if (order.status === 'completed') {
      btns.push(<AppButton key="invoice" text="申请发票" type="outline" size="lg" onClick={handleInvoice} />)
      btns.push(<AppButton key="review" text="去评价" type="primary" size="lg" onClick={handleReview} />)
    }
    return btns
  }

  const invoiceStatus: InvoiceStatus = (order.invoiceStatus || (order.status === 'completed' ? 'none' : undefined)) as InvoiceStatus

  return (
    <View className={styles.page}>
      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.statusHeader}>
          <View style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Text className={styles.statusText}>{statusInfo.text}</Text>
            <StatusBadge status={order.status as OrderStatus} />
          </View>
          <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>陪诊员</Text>
          <View className={styles.companionRow}>
            <Avatar src={order.companionAvatar} name={order.companionName} size="md" />
            <View className={styles.info}>
              <Text className={styles.name}>{order.companionName}</Text>
              <Text className={styles.rating}>★ 4.9 · 从业5年 · 陪诊师资格证</Text>
            </View>
            <Text className={styles.contactBtn} onClick={handleContact}>联系</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>就诊信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.label}>就诊人</Text>
            <Text className={styles.value}>
              {order.patient.name} · {order.patient.gender === 'female' ? '女' : '男'} · {order.patient.age}岁
            </Text>
          </View>
          {order.patient.phone && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>联系电话</Text>
              <Text className={styles.value}>{order.patient.phone}</Text>
            </View>
          )}
          {order.patient.idCard && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>身份证号</Text>
              <Text className={styles.value}>{order.patient.idCard}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.label}>医院</Text>
            <Text className={styles.value}>{order.hospital}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>科室</Text>
            <Text className={styles.value}>{order.department}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>就诊时间</Text>
            <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text className={styles.value}>{order.appointmentDate} {order.appointmentTime}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>集合地点</Text>
            <Text className={styles.value}>{order.meetingPoint}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>预计时长</Text>
            <Text className={styles.value}>{order.estimatedDuration}小时</Text>
          </View>
          {order.patient.healthNotes && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>健康说明</Text>
              <Text className={styles.value}>{order.patient.healthNotes}</Text>
            </View>
          )}
          {order.conditionNotes && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>病情备注</Text>
              <Text className={styles.value}>{order.conditionNotes}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用明细</Text>
          <View className={styles.priceRow}>
            <Text className={styles.label}>陪诊服务费（¥{order.totalAmount / order.estimatedDuration} × {order.estimatedDuration}h）</Text>
            <Text className={styles.value}>¥{order.totalAmount}.00</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.label}>优惠</Text>
            <Text className={styles.value}>-¥0.00</Text>
          </View>
          <View className={styles.totalRow}>
            <Text className={styles.label}>实付金额</Text>
            <Text className={styles.value}>¥{order.paidAmount}.00</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>订单信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.label}>订单编号</Text>
            <Text className={styles.value}>{order.orderNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>创建时间</Text>
            <Text className={styles.value}>{order.createTime}</Text>
          </View>
          {invoiceStatus && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>开票状态</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag
                  text={invoiceStatusText[invoiceStatus]}
                  type={
                    invoiceStatus === 'issued'
                      ? 'primary'
                      : invoiceStatus === 'pending'
                      ? 'info'
                      : 'default'
                  }
                  size="sm"
                />
                {invoiceStatus === 'none' && order.status === 'completed' && (
                  <Text
                    className={styles.invoiceEntry}
                    onClick={handleInvoice}
                  >
                    去申请 ›
                  </Text>
                )}
              </View>
            </View>
          )}
          {order.invoiceId && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>发票编号</Text>
              <Text className={styles.value}>{order.invoiceId}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderActions().length > 0 && (
        <View className={styles.footer}>
          {renderActions()}
        </View>
      )}

      {showReschedule && (
        <View className={styles.modalMask} onClick={() => setShowReschedule(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>申请改期</Text>
            <Picker mode="date" value={newDate} onChange={(e) => setNewDate(e.detail.value)}>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>就诊日期</Text>
                <Text className={styles.formPicker}>{newDate} ›</Text>
              </View>
            </Picker>
            <View style={{ padding: '16rpx 0 8rpx' }}>
              <Text className={styles.formLabel}>就诊时间</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingBottom: 16 }}>
              {timeSlots.map((slot) => (
                <Text
                  key={slot}
                  style={{
                    padding: '12rpx 32rpx',
                    borderRadius: 32,
                    background: newTime === slot ? '#E8F7EF' : '#F2F3F5',
                    color: newTime === slot ? '#2BA471' : '#4E5969',
                    fontSize: 28
                  }}
                  onClick={() => setNewTime(slot)}
                >
                  {slot}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
              <AppButton text="取消" type="ghost" size="lg" onClick={() => setShowReschedule(false)} />
              <AppButton text="确认改期" type="primary" size="lg" onClick={handleConfirmReschedule} />
            </View>
          </View>
        </View>
      )}

      {showSupplement && (
        <View className={styles.modalMask} onClick={() => setShowSupplement(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>补充就诊资料</Text>

            <View style={{ padding: '8rpx 0' }}>
              <Text className={styles.formLabel}>健康情况说明（过敏/慢病史/行动情况）</Text>
            </View>
            <Textarea
              value={healthNotes}
              onInput={(e) => setHealthNotes(e.detail.value)}
              placeholder="如：青霉素过敏、高血压病史8年、可自行行走等"
              style={{
                width: '100%',
                minHeight: 160,
                background: '#F7F8FA',
                borderRadius: 16,
                padding: 20,
                fontSize: 28
              }}
              maxlength={300}
            />

            <View style={{ marginTop: 24 }}>
              <Text className={styles.formLabel}>身份证号（部分医院挂号需要）</Text>
            </View>
            <Input
              value={idCard}
              onInput={(e) => setIdCard(e.detail.value)}
              placeholder="请输入18位身份证号"
              style={{
                width: '100%',
                marginTop: 12,
                background: '#F7F8FA',
                borderRadius: 16,
                padding: 20,
                fontSize: 28
              }}
              maxlength={18}
            />

            <View style={{ marginTop: 24 }}>
              <Text className={styles.formLabel}>其他需要告知陪诊员的备注</Text>
            </View>
            <Textarea
              value={extraNotes}
              onInput={(e) => setExtraNotes(e.detail.value)}
              placeholder="如：需推轮椅、要取上次报告、挂专家号等..."
              style={{
                width: '100%',
                minHeight: 160,
                marginTop: 12,
                background: '#F7F8FA',
                borderRadius: 16,
                padding: 20,
                fontSize: 28
              }}
              maxlength={300}
            />

            <View style={{ flexDirection: 'row', gap: 16, marginTop: 32 }}>
              <AppButton text="取消" type="ghost" size="lg" onClick={() => setShowSupplement(false)} />
              <AppButton text="确认提交" type="primary" size="lg" onClick={handleConfirmSupplement} />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrderDetailPage
