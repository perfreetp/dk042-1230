import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { ServiceProgress } from '@/types'

interface TimelineProps {
  items: ServiceProgress[]
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <View className={styles.timeline}>
      {items.map((item, index) => (
        <View
          key={item.id}
          className={classnames(styles.item, styles[item.status])}
        >
          <View className={styles.dotWrap}>
            <View className={classnames(styles.dot, item.status === 'done' && styles.done, item.status === 'current' && styles.current)} />
            {index < items.length - 1 && <View className={styles.line} />}
          </View>
          <View className={styles.content}>
            <View className={styles.header}>
              <Text className={styles.title}>{item.title}</Text>
              {item.time && <Text className={styles.time}>{item.time}</Text>}
            </View>
            <Text className={styles.desc}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

export default Timeline
