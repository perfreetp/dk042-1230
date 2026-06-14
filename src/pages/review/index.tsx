import React, { useState, useMemo } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import Avatar from '@/components/Avatar'
import AppButton from '@/components/AppButton'
import { useOrderStore } from '@/store/order'
import styles from './index.module.scss'

const ratingTexts = ['', '非常差', '较差', '一般', '满意', '非常满意']
const tagOptions = ['态度很好', '专业可靠', '熟悉流程', '耐心细致', '沟通顺畅', '准时到达', '处理突发好', '家属反馈及时']

const ReviewPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id
  const storeOrders = useOrderStore((s) => s.orders)
  const getOrder = useOrderStore((s) => s.getOrder)
  const order = useMemo(() => getOrder(id || '') || storeOrders.find((o) => o.status === 'completed') || storeOrders[0], [id, getOrder, storeOrders])

  const [rating, setRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>(['态度很好', '专业可靠'])
  const [content, setContent] = useState('')

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    console.log('[Review] 提交评价', { rating, tags: selectedTags, content })
    if (rating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '提交中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '评价成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }, 1000)
  }

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>评价陪诊员</Text>
        <View className={styles.companionRow}>
          <Avatar src={order.companionAvatar} name={order.companionName} size="md" />
          <View className={styles.info}>
            <Text className={styles.name}>{order.companionName}</Text>
            <Text className={styles.sub}>{order.hospital} · {order.department} · {order.appointmentDate}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>服务评分</Text>
        <View className={styles.ratingRow}>
          <View className={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Text
                key={n}
                className={classnames(styles.star, n <= rating && styles.active)}
                onClick={() => setRating(n)}
              >
                ★
              </Text>
            ))}
          </View>
          <Text className={styles.ratingText}>{ratingTexts[rating]}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>标签评价（可多选）</Text>
        <View className={styles.tagGroup}>
          {tagOptions.map((tag) => (
            <Text
              key={tag}
              className={classnames(styles.tagItem, selectedTags.includes(tag) && styles.active)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>文字评价</Text>
        <View className={styles.textareaRow}>
          <Textarea
            className={styles.textarea}
            placeholder="请分享您的陪诊体验，帮助其他用户做出更好的选择..."
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
          />
          <Text className={styles.counter}>{content.length}/500</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <AppButton text="提交评价" type="primary" size="block" onClick={handleSubmit} />
      </View>
    </View>
  )
}

export default ReviewPage
