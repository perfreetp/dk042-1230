import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const initial = name ? name.charAt(0) : '用'

  return (
    <View className={classnames(styles.avatar, styles[size], className)}>
      {src ? (
        <Image
          className={styles.image}
          src={src}
          mode="aspectFill"
          onError={(e) => console.error('[Avatar] 图片加载失败', e)}
        />
      ) : (
        <Text className={styles.text}>{initial}</Text>
      )}
    </View>
  )
}

export default Avatar
