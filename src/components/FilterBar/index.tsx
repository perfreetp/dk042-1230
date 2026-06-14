import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

export interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  filters: {
    key: string
    label: string
    options: FilterOption[]
  }[]
  activeFilters: Record<string, string>
  onChange: (key: string, value: string) => void
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, activeFilters, onChange }) => {
  return (
    <View className={styles.filterBar}>
      <ScrollView scrollX enhanced showScrollbar={false} className={styles.scroll}>
        <View className={styles.inner}>
          {filters.map((filter) => (
            <View key={filter.key} className={styles.filterGroup}>
              <Text className={styles.groupLabel}>{filter.label}：</Text>
              <View className={styles.options}>
                {filter.options.map((opt) => {
                  const active = activeFilters[filter.key] === opt.value
                  return (
                    <View
                      key={opt.value}
                      className={classnames(styles.option, active && styles.active)}
                      onClick={() => onChange(filter.key, opt.value)}
                    >
                      <Text className={styles.optionText}>{opt.label}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default FilterBar
