import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

type ButtonType = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'block'

interface AppButtonProps {
  text: string
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
}

const AppButton: React.FC<AppButtonProps> = ({
  text,
  type = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className
}) => {
  const handleClick = () => {
    if (disabled || loading) return
    Taro.vibrateShort({ type: 'light' }).catch(() => {})
    onClick?.()
  }

  return (
    <View
      className={classnames(
        styles.btn,
        styles[type],
        styles[size],
        disabled && styles.disabled,
        loading && styles.loading,
        className
      )}
      onClick={handleClick}
    >
      <Button className={styles.nativeBtn} disabled={disabled || loading} />
      {loading && <Text className={styles.spinner} />}
      <Text className={styles.text}>{text}</Text>
    </View>
  )
}

export default AppButton
