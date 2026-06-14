import React, { useState, useMemo } from 'react'
import { View, Text, Input, Textarea, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import AppButton from '@/components/AppButton'
import Avatar from '@/components/Avatar'
import { companions, hospitals, departments } from '@/data/companions'
import styles from './index.module.scss'

const durations = [2, 3, 4, 5, 6]
const slots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00']

const BookingPage: React.FC = () => {
  const router = useRouter()
  const companionId = router.params.companionId

  const companion = useMemo(() => companions.find((c) => c.id === companionId) || companions[0], [companionId])

  const [patientName, setPatientName] = useState('')
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('female')
  const [patientAge, setPatientAge] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [hospital, setHospital] = useState('')
  const [department, setDepartment] = useState('')
  const [date, setDate] = useState('2026-06-15')
  const [timeSlot, setTimeSlot] = useState('')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [duration, setDuration] = useState(4)
  const [conditionNotes, setConditionNotes] = useState('')

  const totalPrice = useMemo(() => companion.pricePerHour * duration, [companion, duration])

  const handleSubmit = () => {
    console.log('[Booking] 提交订单', { patientName, patientAge, hospital, department, date, timeSlot, duration })
    if (!patientName || !patientAge || !patientPhone || !hospital || !department || !timeSlot || !meetingPoint) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认预约',
      content: `确认预约${companion.name}陪诊服务？共${duration}小时，费用¥${totalPrice}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' })
          setTimeout(() => {
            Taro.hideLoading()
            Taro.showToast({ title: '预约成功', icon: 'success' })
            setTimeout(() => {
              Taro.switchTab({ url: '/pages/orders/index' })
            }, 1500)
          }, 1000)
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>陪诊员</Text>
        <View className={styles.formRow} style={{ borderBottom: 'none' }}>
          <Avatar src={companion.avatar} name={companion.name} size="md" />
          <View style={{ flex: 1, marginLeft: 24 }}>
            <Text style={{ fontSize: 30, fontWeight: 600, color: '#1D2129' }}>{companion.name}</Text>
            <Text style={{ fontSize: 24, color: '#86909C', marginLeft: 12 }}>★ {companion.rating}</Text>
          </View>
          <Text style={{ fontSize: 32, fontWeight: 700, color: '#F53F3F' }}>¥{companion.pricePerHour}/小时</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>就诊人信息</Text>
        <View className={styles.formRow}>
          <Text className={styles.label}><Text className={styles.required}>*</Text>姓名</Text>
          <Input
            className={styles.input}
            placeholder="请输入就诊人姓名"
            value={patientName}
            onInput={(e) => setPatientName(e.detail.value)}
          />
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}><Text className={styles.required}>*</Text>性别</Text>
          <View style={{ flex: 1, flexDirection: 'row', gap: 24 }}>
            <Text
              className={classnames({ [styles.durationItem || '']: true, active: patientGender === 'male' })}
              style={{
                padding: '12rpx 32rpx',
                borderRadius: '32rpx',
                background: patientGender === 'male' ? '#E8F7EF' : '#F2F3F5',
                color: patientGender === 'male' ? '#2BA471' : '#4E5969',
                fontSize: 28
              }}
              onClick={() => setPatientGender('male')}
            >男</Text>
            <Text
              style={{
                padding: '12rpx 32rpx',
                borderRadius: '32rpx',
                background: patientGender === 'female' ? '#E8F7EF' : '#F2F3F5',
                color: patientGender === 'female' ? '#2BA471' : '#4E5969',
                fontSize: 28
              }}
              onClick={() => setPatientGender('female')}
            >女</Text>
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}><Text className={styles.required}>*</Text>年龄</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入年龄"
            value={patientAge}
            onInput={(e) => setPatientAge(e.detail.value)}
          />
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}><Text className={styles.required}>*</Text>手机号</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入联系电话"
            value={patientPhone}
            onInput={(e) => setPatientPhone(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>就诊信息</Text>
        <Picker
          mode="selector"
          range={hospitals.map((h) => h.name)}
          onChange={(e) => setHospital(hospitals[e.detail.value].name)}
        >
          <View className={styles.formRow}>
            <Text className={styles.label}><Text className={styles.required}>*</Text>医院</Text>
            {hospital ? (
              <Text className={styles.picker}>{hospital}</Text>
            ) : (
              <Text className={styles.placeholder}>请选择医院</Text>
            )}
            <Text className={styles.arrow}>›</Text>
          </View>
        </Picker>
        <Picker
          mode="selector"
          range={departments.map((d) => d.name)}
          onChange={(e) => setDepartment(departments[e.detail.value].name)}
        >
          <View className={styles.formRow}>
            <Text className={styles.label}><Text className={styles.required}>*</Text>科室</Text>
            {department ? (
              <Text className={styles.picker}>{department}</Text>
            ) : (
              <Text className={styles.placeholder}>请选择科室</Text>
            )}
            <Text className={styles.arrow}>›</Text>
          </View>
        </Picker>
        <Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value)}>
          <View className={styles.formRow}>
            <Text className={styles.label}><Text className={styles.required}>*</Text>日期</Text>
            <Text className={styles.picker}>{date}</Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </Picker>
        <View className={styles.formRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text className={styles.label} style={{ marginBottom: 16 }}><Text className={styles.required}>*</Text>时间</Text>
          <View className={styles.slotList}>
            {slots.map((slot) => (
              <Text
                key={slot}
                className={classnames(styles.slotItem, timeSlot === slot && styles.active)}
                onClick={() => setTimeSlot(slot)}
              >
                {slot}
              </Text>
            ))}
          </View>
        </View>
        <View className={styles.formRow}>
          <Text className={styles.label}><Text className={styles.required}>*</Text>集合地点</Text>
          <Input
            className={styles.input}
            placeholder="如：医院东门、门诊大厅"
            value={meetingPoint}
            onInput={(e) => setMeetingPoint(e.detail.value)}
          />
        </View>
        <View className={styles.formRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text className={styles.label} style={{ marginBottom: 16 }}><Text className={styles.required}>*</Text>预计时长</Text>
          <View className={styles.durationRow} style={{ width: '100%' }}>
            {durations.map((d) => (
              <Text
                key={d}
                className={classnames(styles.durationItem, duration === d && styles.active)}
                onClick={() => setDuration(d)}
              >
                {d}小时
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>病情备注</Text>
        <View className={styles.textareaRow} style={{ borderBottom: 'none' }}>
          <Text className={styles.label}>请简要说明病情及特殊需求（选填）</Text>
          <Textarea
            className={styles.textarea}
            placeholder="如：高血压病史，行动不便需搀扶，有药物过敏史等..."
            value={conditionNotes}
            onInput={(e) => setConditionNotes(e.detail.value)}
            maxlength={500}
          />
        </View>
      </View>

      <View className={classnames(styles.section, styles.priceSection)}>
        <Text className={styles.sectionTitle}>费用明细</Text>
        <View className={styles.priceRow}>
          <Text className={styles.priceLabel}>陪诊服务费</Text>
          <Text className={styles.priceValue}>¥{companion.pricePerHour} × {duration}小时</Text>
        </View>
        <View className={styles.priceRow}>
          <Text className={styles.priceLabel}>服务费</Text>
          <Text className={styles.priceValue}>¥0.00</Text>
        </View>
        <View className={styles.totalRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalValue}>¥{totalPrice}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <AppButton text={`提交订单  ¥${totalPrice}`} type="primary" size="block" onClick={handleSubmit} />
      </View>
    </View>
  )
}

export default BookingPage
