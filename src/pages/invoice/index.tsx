import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import AppButton from '@/components/AppButton'
import Tag from '@/components/Tag'
import { useOrderStore } from '@/store/order'
import type { Order } from '@/types'
import styles from './index.module.scss'

const InvoicePage: React.FC = () => {
  const router = useRouter()
  const orderIdParam = router.params.orderId
  const storeOrders = useOrderStore((s) => s.orders)
  const applyInvoice = useOrderStore((s) => s.applyInvoice)

  const completedOrders = useMemo(() => storeOrders.filter((o) => o.status === 'completed'), [storeOrders])

  const [type, setType] = useState<'personal' | 'company'>('personal')
  const [title, setTitle] = useState('')
  const [taxNo, setTaxNo] = useState('')
  const [email, setEmail] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (orderIdParam && completedOrders.some((o) => o.id === orderIdParam && !o.invoiceStatus || o.invoiceStatus === 'none')) {
      setSelectedIds([orderIdParam])
      const order = completedOrders.find((o) => o.id === orderIdParam)
      if (order) {
        console.log('[Invoice] 从订单带入:', order.patient.name, order.totalAmount)
      }
    } else if (completedOrders.length > 0) {
      const uninvoiced = completedOrders.filter((o) => !o.invoiceStatus || o.invoiceStatus === 'none')
      if (uninvoiced.length > 0) {
        setSelectedIds([uninvoiced[0].id])
      }
    }
  }, [orderIdParam, completedOrders])

  useDidShow(() => {
    console.log('[Invoice] 可开票订单数:', completedOrders.length, '已选:', selectedIds.length)
  })

  const toggleOrder = (orderId: string) => {
    const order = storeOrders.find((o) => o.id === orderId)
    if (order?.invoiceStatus && order.invoiceStatus !== 'none') {
      Taro.showToast({ title: `该订单已${order.invoiceStatus === 'pending' ? '开票中' : '开票'}`, icon: 'none' })
      return
    }
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const selectedOrders = useMemo(
    () => selectedIds.map((id) => storeOrders.find((o) => o.id === id)).filter(Boolean) as Order[],
    [selectedIds, storeOrders]
  )
  const totalAmount = useMemo(() => selectedOrders.reduce((sum, o) => sum + (o?.totalAmount || 0), 0), [selectedOrders])
  const pendingCount = completedOrders.filter((o) => o.invoiceStatus === 'pending').length
  const uninvoicedCount = completedOrders.filter((o) => !o.invoiceStatus || o.invoiceStatus === 'none').length

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请至少选择一笔订单', icon: 'none' })
      return
    }
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
    Taro.showModal({
      title: '确认开票',
      content: `即将为 ${selectedIds.length} 笔订单开具电子发票，合计 ¥${totalAmount}.00，将发送至 ${email}。`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' })
          setTimeout(() => {
            applyInvoice({
              orderIds: selectedIds,
              type,
              title,
              taxNo: type === 'company' ? taxNo : undefined,
              email,
              amount: totalAmount
            })
            Taro.hideLoading()
            Taro.showToast({ title: '开票申请已提交', icon: 'success' })
            setTimeout(() => Taro.navigateBack(), 1500)
          }, 800)
        }
      }
    })
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
          <Text className={styles.formLabel}>
            <Text style={{ color: '#F53F3F', marginRight: 4 }}>*</Text>
            {type === 'personal' ? '个人姓名' : '企业名称'}
          </Text>
          <Input
            className={styles.formInput}
            placeholder={type === 'personal' ? '请输入个人姓名' : '请输入企业名称'}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        {type === 'company' && (
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>
              <Text style={{ color: '#F53F3F', marginRight: 4 }}>*</Text>税号
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入纳税人识别号"
              value={taxNo}
              onInput={(e) => setTaxNo(e.detail.value)}
            />
          </View>
        )}

        <View className={styles.formRow}>
          <Text className={styles.formLabel}>
            <Text style={{ color: '#F53F3F', marginRight: 4 }}>*</Text>接收邮箱
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入接收电子发票的邮箱"
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.section}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className={styles.sectionTitle}>开票订单（可多选合并开票）</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {uninvoicedCount > 0 && (
              <Text
                className={styles.selectAllBtn}
                onClick={() => {
                  setSelectedIds(completedOrders.filter((o) => !o.invoiceStatus || o.invoiceStatus === 'none').map((o) => o.id))
                }}
              >
                全选未开
              </Text>
            )}
            {selectedIds.length > 0 && (
              <Text className={styles.clearAllBtn} onClick={() => setSelectedIds([])}>
                清空
              </Text>
            )}
          </View>
        </View>

        {pendingCount > 0 && (
          <View style={{
            marginTop: 16,
            padding: 16,
            background: 'rgba(51,112,255,0.08)',
            borderRadius: 12,
            fontSize: 24,
            color: '#3370FF',
            marginBottom: 16
          }}>
            💡 另有 {pendingCount} 笔订单正在开票中，请耐心等待发送至邮箱。
          </View>
        )}

        {completedOrders.length > 0 ? (
          completedOrders.map((order) => {
            const status = order.invoiceStatus || 'none'
            const disabled = status !== 'none'
            const selected = selectedIds.includes(order.id)
            return (
              <View
                key={order.id}
                className={classnames(
                  styles.orderRow,
                  disabled && styles.disabledRow,
                  selected && styles.selectedRow
                )}
                onClick={() => toggleOrder(order.id)}
              >
                <View className={styles.checkbox}>
                  {selected ? '✓' : ''}
                </View>
                <View className={styles.orderInfo}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text className={styles.orderNo}>{order.orderNo}</Text>
                    {status !== 'none' && (
                      <Tag
                        text={status === 'pending' ? '开票中' : '已开票'}
                        type={status === 'pending' ? 'info' : 'primary'}
                        size="sm"
                      />
                    )}
                  </View>
                  <Text className={styles.orderDesc}>
                    {order.hospital} · {order.department}
                  </Text>
                  <Text className={styles.orderSub}>
                    就诊人{order.patient.name} · {order.appointmentDate} · 陪诊{order.estimatedDuration}小时
                  </Text>
                </View>
                <Text className={styles.amount}>¥{order.totalAmount}.00</Text>
              </View>
            )
          })
        ) : (
          <Text style={{
            fontSize: 28,
            color: '#86909C',
            textAlign: 'center',
            padding: '32rpx 0'
          }}>
            暂无可开票订单，完成陪诊服务后即可申请
          </Text>
        )}
      </View>

      <View className={styles.summaryRow}>
        <Text className={styles.summaryLabel}>
          已选 {selectedIds.length} 笔，共
        </Text>
        <Text className={styles.summaryAmount}>¥{totalAmount}.00</Text>
      </View>

      <View className={styles.tipBox}>
        <Text className={styles.tipTitle}>温馨提示</Text>
        <Text className={styles.tipText}>
          1. 电子发票将在1-3个工作日内发送至您填写的邮箱{'\n'}
          2. 同一就诊人的多笔订单可合并开票{'\n'}
          3. 发票一经开具，不可更换抬头
        </Text>
      </View>

      <View className={styles.footer}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text className={styles.footerLabel}>开票金额</Text>
          <View>
            <Text className={styles.footerAmount}>¥{totalAmount}.00</Text>
            {selectedIds.length > 0 && (
              <Text className={styles.footerSub}>（{selectedIds.length} 笔订单）</Text>
            )}
          </View>
        </View>
        <AppButton text="提交开票" type="primary" size="lg" onClick={handleSubmit} />
      </View>
    </View>
  )
}

export default InvoicePage
