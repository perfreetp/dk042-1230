import React from 'react'
import Tag from '../Tag'
import type { OrderStatus } from '@/types'

interface StatusBadgeProps {
  status: OrderStatus
}

const statusMap: Record<OrderStatus, { text: string; type: any }> = {
  pending: { text: '待支付', type: 'warning' },
  confirmed: { text: '待服务', type: 'info' },
  in_service: { text: '服务中', type: 'primary' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'default' },
  refunded: { text: '已退款', type: 'default' }
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = statusMap[status]
  return <Tag text={cfg.text} type={cfg.type} size="sm" />
}

export default StatusBadge
