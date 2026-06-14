import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import Avatar from '@/components/Avatar'
import StatusBadge from '@/components/StatusBadge'
import AppButton from '@/components/AppButton'
import { useOrderStore } from '@/store/order'
import type { OrderStatus } from '@/types'
import styles from './index.module.scss'

type TabType = 'all' | OrderStatus

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'confirmed', label: '待服务' },
  { key: 'in_service', label: '服务中' },
  { key: 'completed', label: '已完成' }
]

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const storeOrders = useOrderStore((s) => s.orders)
  const cancelOrder = useOrderStore((s) => s.cancelOrder)
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)

  useDidShow(() => {
    console.log('[Orders] useDidShow, 订单数量:', storeOrders.length)
  })

  const filteredOrders = useMemo(() => {
    const sorted = [...storeOrders].sort((a, b) => b.createTime.localeCompare(a.createTime))
    if (activeTab === 'all') return sorted
    return sorted.filter((o) => o.status === activeTab)
  }, [activeTab, storeOrders])

  const handleClickOrder = (orderId: string, status: OrderStatus) => {
    console.log('[Orders] 点击订单:', orderId)
    if (status === 'in_service') {
      Taro.navigateTo({ url: `/pages/in-service/index?id=${orderId}` })
    } else {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` })
    }
  }

  const handleAction = (action: string, orderId: string) => {
    console.log('[Orders] 操作:', action, orderId)
    switch (action) {
      case 'pay':
        updateOrderStatus(orderId, 'confirmed')
        Taro.showToast({ title: '支付成功', icon: 'success' })
        break
      case 'cancel':
        Taro.showModal({
          title: '确认取消',
          content: '确定要取消该订单吗？已支付的款项将在1-3个工作日原路退回。',
          success: (res) => {
            if (res.confirm) {
              cancelOrder(orderId)
              Taro.showToast({ title: '已取消', icon: 'success' })
            }
          }
        })
        break
      case 'contact':
        Taro.showToast({ title: '正在呼叫陪诊员...', icon: 'none' })
        break
      case 'review':
        Taro.navigateTo({ url: `/pages/review/index?id=${orderId}` })
        break
      case 'invoice':
        Taro.navigateTo({ url: `/pages/invoice/index?orderId=${orderId}` })
        break
      case 'reschedule':
        Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}&action=reschedule` })
        break
    }
  }

  const renderActions = (status: OrderStatus, orderId: string) => {
    const btns = []
    if (status === 'pending') {
      btns.push(
        <AppButton key="cancel" text="取消订单" type="ghost" size="sm" onClick={() => handleAction('cancel', orderId)} />,
        <AppButton key="pay" text="立即支付" type="primary" size="sm" onClick={() => handleAction('pay', orderId)} />
      )
    } else if (status === 'confirmed') {
      btns.push(
        <AppButton key="cancel" text="取消订单" type="ghost" size="sm" onClick={() => handleAction('cancel', orderId)} />,
        <AppButton key="reschedule" text="申请改期" type="outline" size="sm" onClick={() => handleAction('reschedule', orderId)} />,
        <AppButton key="contact" text="联系陪诊员" type="primary" size="sm" onClick={() => handleAction('contact', orderId)} />
      )
    } else if (status === 'in_service') {
      btns.push(
        <AppButton key="contact" text="实时查看" type="primary" size="sm" onClick={() => handleClickOrder(orderId, status)} />
      )
    } else if (status === 'completed') {
      btns.push(
        <AppButton key="invoice" text="申请发票" type="ghost" size="sm" onClick={() => handleAction('invoice', orderId)} />,
        <AppButton key="review" text="去评价" type="primary" size="sm" onClick={() => handleAction('review', orderId)} />
      )
    }
    return btns
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
          </View>
        ))}
      </View>

      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.orderList}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <View
                key={order.id}
                className={styles.orderCard}
                onClick={() => handleClickOrder(order.id, order.status)}
              >
                <View className={styles.cardHeader}>
                  <Text className={styles.hospital}>{order.hospital}</Text>
                  <StatusBadge status={order.status} />
                </View>

                <View className={styles.cardBody}>
                  <Avatar src={order.companionAvatar} name={order.companionName} size="md" />
                  <View className={styles.info}>
                    <View className={styles.patientRow}>
                      <Text className={styles.name}>{order.patient.name}</Text>
                      <Text className={styles.dept}>{order.department}</Text>
                    </View>
                    <Text className={styles.timeRow}>
                      {order.appointmentDate} {order.appointmentTime} · {order.companionName}陪同
                    </Text>
                  </View>
                </View>

                <View className={styles.cardFooter}>
                  <View className={styles.amount}>
                    实付<Text className={styles.amountNum}>¥{order.totalAmount}</Text>
                  </View>
                  <View className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    {renderActions(order.status, order.id)}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyText}>暂无订单</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default OrdersPage
