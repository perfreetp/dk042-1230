import React, { useState, useMemo } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import AppButton from '@/components/AppButton'
import { orders } from '@/data/orders'
import styles from './index.module.scss'

const InvoicePage: React.FC = () => {
  const router = useRouter()
  const orderId = router.params.orderId

  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'completed'), [])
  const selectedOrderId = orderId || completedOrders[0]?.id || ''

  const [type, setType] = useState<'personal' | 'company'>('personal')
  const [title, setTitle] = useState('')
  const [taxNo, setTaxNo] = useState('')
  const [email, setEmail] = useState('')

  const totalAmount = useMemo(() => {
    const order = orders.find((o) => o.id === selectedOrderId)
    return order?.totalAmount || 0
  }, [selectedOrderId])

  const handleSubmit = () => {
    console.log('[Invoice] 提交发票申请', { type, title, taxNo, email, orderId: selectedOrderId })
    if (!title) {
      Taro.showToast({ title: '请填写发票抬头', icon: 'none' })
      return
    }
    if (type === 'company' && !taxNo) {
      Taro.showToast({ title: '请填写企业税号', icon: 'none' })
      return
    }
    if (!email) {
      Taro.showToast({ title: '请填写接收邮箱', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '提交中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '申请已提交', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }, 1000)
  }

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>发票类型</Text>
        <View className={styles.typeTabs}>
          <Text
            className={classnames(styles.tab, type === 'personal' && styles.active)}
            onClick={() => setType('personal')}
          >
            个人
          </Text>
          <Text
            className={classnames(styles.tab, type === 'company' && styles.active)}
            onClick={() => setType('company')}
          >
            企业单位
          </Text>
        </View>

        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>
            {type === 'personal' ? '个人姓名' : '企业名称'}
          </Text>
          <Input
            className={styles.input}
            placeholder={type === 'personal' ? '请输入个人姓名' : '请输入企业名称'}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        {type === 'company' && (
          <View className={styles.formRow}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>税号
            </Text>
            <Input
              className={styles.input}
              placeholder="请输入纳税人识别号"
              value={taxNo}
              onInput={(e) => setTaxNo(e.detail.value)}
            />
          </View>
        )}

        <View className={styles.formRow}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>接收邮箱
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入接收电子发票的邮箱"
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>开票订单</Text>
        {completedOrders.length > 0 ? (
          completedOrders.map((order) => (
            <View key={order.id} className={styles.orderRow}>
              <View className={styles.orderInfo}>
                <Text className={styles.orderNo}>{order.orderNo}</Text>
                <Text className={styles.orderDesc}>
                  {order.hospital} · {order.department} · {order.appointmentDate}
                </Text>
              </View>
              <Text className={styles.amount}>¥{order.totalAmount}.00</Text>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 28, color: '#86909C', textAlign: 'center', padding: '32rpx 0' }}>
            暂无可开票订单
          </Text>
        )}
      </View>

      <View className={styles.tipBox}>
        <Text className={styles.tipTitle}>温馨提示</Text>
        <Text className={styles.tipText}>
          1. 电子发票将在1-3个工作日内发送至您填写的邮箱{'\n'}
          2. 发票一经开具，不可更换抬头{'\n'}
          3. 如有疑问请联系客服
        </Text>
      </View>

      <View className={styles.footer}>
        <View>
          <Text className={styles.totalLabel}>开票金额</Text>
          <Text className={styles.totalAmount}> ¥{totalAmount}.00</Text>
        </View>
        <AppButton text="提交申请" type="primary" size="lg" onClick={handleSubmit} />
      </View>
    </View>
  )
}

export default InvoicePage
