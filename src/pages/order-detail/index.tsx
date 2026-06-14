import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import Avatar from '@/components/Avatar'
import AppButton from '@/components/AppButton'
import { orders } from '@/data/orders'
import styles from './index.module.scss'

const statusTextMap: Record<string, { text: string; desc: string }> = {
  pending: { text: '待支付', desc: '请尽快完成支付，超时订单将自动取消' },
  confirmed: { text: '待服务', desc: '陪诊员将在就诊当天提前到达' },
  in_service: { text: '服务进行中', desc: '陪诊员正在陪同就诊，点击查看实时进展' },
  completed: { text: '服务已完成', desc: '感谢您的使用，欢迎评价陪诊服务' },
  cancelled: { text: '订单已取消', desc: '如有疑问请联系客服' },
  refunded: { text: '已退款', desc: '退款已原路退回' }
}

const OrderDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id
  const order = useMemo(() => orders.find((o) => o.id === id) || orders[0], [id])
  const statusInfo = statusTextMap[order.status]

  const handleContact = () => Taro.showToast({ title: '正在联系陪诊员...', icon: 'none' })
  const handleReschedule = () => Taro.showToast({ title: '改期功能开发中', icon: 'none' })
  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: (res) => res.confirm && Taro.showToast({ title: '取消成功', icon: 'success' })
    })
  }
  const handleSupplement = () => Taro.showToast({ title: '补充资料功能开发中', icon: 'none' })
  const handleService = () => Taro.navigateTo({ url: `/pages/in-service/index?id=${order.id}` })
  const handleReview = () => Taro.navigateTo({ url: `/pages/review/index?id=${order.id}` })
  const handleInvoice = () => Taro.navigateTo({ url: `/pages/invoice/index?orderId=${order.id}` })

  const renderActions = () => {
    const btns = []
    if (order.status === 'pending') {
      btns.push(<AppButton key="cancel" text="取消订单" type="ghost" size="lg" onClick={handleCancel} />)
      btns.push(<AppButton key="pay" text="立即支付" type="primary" size="lg" onClick={() => Taro.showToast({ title: '支付功能开发中', icon: 'none' })} />)
    } else if (order.status === 'confirmed') {
      btns.push(<AppButton key="cancel" text="取消订单" type="ghost" size="lg" onClick={handleCancel} />)
      btns.push(<AppButton key="reschedule" text="申请改期" type="outline" size="lg" onClick={handleReschedule} />)
      btns.push(<AppButton key="contact" text="联系陪诊员" type="primary" size="lg" onClick={handleContact} />)
    } else if (order.status === 'in_service') {
      btns.push(<AppButton key="supplement" text="补充资料" type="outline" size="lg" onClick={handleSupplement} />)
      btns.push(<AppButton key="view" text="查看进展" type="primary" size="lg" onClick={handleService} />)
    } else if (order.status === 'completed') {
      btns.push(<AppButton key="invoice" text="申请发票" type="outline" size="lg" onClick={handleInvoice} />)
      btns.push(<AppButton key="review" text="去评价" type="primary" size="lg" onClick={handleReview} />)
    }
    return btns
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.statusHeader}>
          <Text className={styles.statusText}>{statusInfo.text}</Text>
          <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>陪诊员</Text>
          <View className={styles.companionRow}>
            <Avatar src={order.companionAvatar} name={order.companionName} size="md" />
            <View className={styles.info}>
              <Text className={styles.name}>{order.companionName}</Text>
              <Text className={styles.rating}>★ 4.9 · 陪诊师资格证</Text>
            </View>
            <Text className={styles.contactBtn} onClick={handleContact}>联系</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>就诊信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.label}>就诊人</Text>
            <Text className={styles.value}>{order.patient.name} · {order.patient.gender === 'female' ? '女' : '男'} · {order.patient.age}岁</Text>
          </View>
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
            <Text className={styles.value}>{order.appointmentDate} {order.appointmentTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>集合地点</Text>
            <Text className={styles.value}>{order.meetingPoint}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>预计时长</Text>
            <Text className={styles.value}>{order.estimatedDuration}小时</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>联系电话</Text>
            <Text className={styles.value}>{order.patient.phone}</Text>
          </View>
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
            <Text className={styles.label}>陪诊服务费</Text>
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
        </View>
      </ScrollView>

      <View className={styles.footer}>
        {renderActions()}
      </View>
    </View>
  )
}

export default OrderDetailPage
