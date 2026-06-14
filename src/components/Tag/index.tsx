import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

type TagType = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default'

interface TagProps {
  text: string
  type?: TagType
  size?: 'sm' | 'md'
  className?: string
}

const Tag: React.FC<TagProps> = ({ text, type = 'default', size = 'sm', className }) => {
  return (
    <View className={classnames(styles.tag, styles[type], styles[size], className)}>
      <Text className={styles.text}>{text}</Text>
    </View>
  )
}

export default Tag
