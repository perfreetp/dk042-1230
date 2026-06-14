import { create } from 'zustand'
import type { Order, OrderStatus, Patient, ServiceUpdate, ServiceProgress, CheckReminder, Message, MessageCategory, InvoiceStatus } from '@/types'
import { orders as mockOrders } from '@/data/orders'
import { messages as mockMessages } from '@/data/messages'

interface OrderStore {
  orders: Order[]
  messages: Message[]

  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createTime' | 'status' | 'paidAmount' | 'invoiceStatus'> & { patient: Patient }) => string

  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  cancelOrder: (orderId: string) => void
  rescheduleOrder: (orderId: string, newDate: string, newTime: string) => void
  supplementInfo: (orderId: string, info: { healthNotes?: string; idCard?: string; extraNotes?: string }) => void

  addServiceUpdate: (orderId: string, update: Omit<ServiceUpdate, 'id' | 'time'>) => void
  completeService: (orderId: string) => void

  markMessageRead: (msgId: string) => void
  markAllMessagesRead: () => void

  applyInvoice: (params: {
    orderIds: string[]
    type: 'personal' | 'company'
    title: string
    taxNo?: string
    email: string
    amount: number
  }) => string

  getOrder: (orderId: string) => Order | undefined
}

const genOrderNo = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PZ${y}${m}${d}${rand}`
}

const genId = (prefix: string) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`

const nowStr = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

const timeStr = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const initOrders: Order[] = mockOrders.map((o) => ({
  ...o,
  invoiceStatus: o.status === 'completed' ? 'none' : undefined
}))

const _pushMessage = (
  state: { messages: Message[]; orders: Order[] },
  params: {
    orderId: string
    category: MessageCategory
    title: string
    content: string
    extra?: Record<string, any>
  }
): Message[] => {
  const msg: Message = {
    id: genId('m'),
    category: params.category,
    title: params.title,
    content: params.content,
    time: nowStr(),
    read: false,
    orderId: params.orderId,
    extra: params.extra
  }
  return [msg, ...state.messages]
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: initOrders,
  messages: [...mockMessages],

  addOrder: (data) => {
    const orderId = genId('o')
    const orderNo = genOrderNo()
    const newOrder: Order = {
      id: orderId,
      orderNo,
      companionId: data.companionId,
      companionName: data.companionName,
      companionAvatar: data.companionAvatar,
      patient: data.patient,
      hospital: data.hospital,
      department: data.department,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      meetingPoint: data.meetingPoint,
      estimatedDuration: data.estimatedDuration,
      conditionNotes: data.conditionNotes || '',
      status: 'confirmed',
      totalAmount: data.totalAmount,
      paidAmount: data.totalAmount,
      createTime: nowStr(),
      invoiceStatus: undefined
    }

    set((state) => {
      const nextOrders = [newOrder, ...state.orders]
      const nextMessages = _pushMessage(
        { messages: state.messages, orders: nextOrders },
        {
          orderId,
          category: 'system',
          title: '预约成功',
          content: `${newOrder.patient.name} 的${newOrder.department}陪诊预约已确认，${newOrder.appointmentDate} ${newOrder.appointmentTime} 在${newOrder.meetingPoint}集合，陪诊员${newOrder.companionName}将准时等候。`
        }
      )
      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 订单已创建:', orderId, orderNo)
    return orderId
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const nextOrders = state.orders.map((o) => (o.id === orderId ? { ...o, status } : o))
      const order = nextOrders.find((o) => o.id === orderId)
      let nextMessages = state.messages
      if (order) {
        let cat: MessageCategory = 'system'
        let title = ''
        let content = ''
        if (status === 'confirmed') {
          cat = 'system'
          title = '订单支付成功'
          content = `${order.orderNo} 已完成支付，陪诊服务已确认。`
        } else if (status === 'in_service') {
          cat = 'trip'
          title = '陪诊服务开始'
          content = `${order.companionName}已与${order.patient.name}碰面，陪诊服务正式开始。`
        } else if (status === 'completed') {
          cat = 'trip'
          title = '陪诊服务完成'
          content = `${order.patient.name}的陪诊服务已顺利完成，感谢使用！您可以评价陪诊员或申请发票。`
        } else if (status === 'cancelled') {
          cat = 'system'
          title = '订单已取消'
          content = `订单${order.orderNo}已取消，退款¥${order.paidAmount}将在1-3个工作日原路退回。`
        }
        if (title) {
          nextMessages = _pushMessage({ messages: state.messages, orders: nextOrders }, { orderId, category: cat, title, content })
        }
      }
      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 订单状态更新:', orderId, '→', status)
  },

  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    }))
  },

  cancelOrder: (orderId) => {
    get().updateOrderStatus(orderId, 'cancelled')
  },

  rescheduleOrder: (orderId, newDate, newTime) => {
    set((state) => {
      const nextOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, appointmentDate: newDate, appointmentTime: newTime } : o
      )
      const order = nextOrders.find((o) => o.id === orderId)
      const nextMessages = order
        ? _pushMessage(
            { messages: state.messages, orders: nextOrders },
            {
              orderId,
              category: 'trip',
              title: '订单改期成功',
              content: `订单${order.orderNo}就诊时间已改为${newDate} ${newTime}，请提醒${order.patient.name}准时前往。`
            }
          )
        : state.messages
      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 改期成功:', orderId, newDate, newTime)
  },

  supplementInfo: (orderId, info) => {
    set((state) => {
      const nextOrders = state.orders.map((o) => {
        if (o.id !== orderId) return o
        const newPatient = {
          ...o.patient,
          healthNotes: info.healthNotes || o.patient.healthNotes,
          idCard: info.idCard || o.patient.idCard
        }
        const notesExtra = info.extraNotes
          ? o.conditionNotes
            ? `${o.conditionNotes} | 补充：${info.extraNotes}`
            : `补充：${info.extraNotes}`
          : o.conditionNotes
        return { ...o, patient: newPatient, conditionNotes: notesExtra }
      })
      const order = nextOrders.find((o) => o.id === orderId)
      const nextMessages = order
        ? _pushMessage(
            { messages: state.messages, orders: nextOrders },
            {
              orderId,
              category: 'system',
              title: '就诊资料已更新',
              content: `订单${order.orderNo}的就诊人资料已更新，陪诊员${order.companionName}将收到最新信息。`
            }
          )
        : state.messages
      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 资料已补充:', orderId)
  },

  addServiceUpdate: (orderId, update) => {
    set((state) => {
      const nextOrders = state.orders.map((o) => {
        if (o.id !== orderId) return o
        const newUpdate: ServiceUpdate = {
          id: genId('u'),
          type: update.type,
          content: update.content,
          time: timeStr()
        }
        const existing = o.updates || []
        return { ...o, updates: [...existing, newUpdate] }
      })

      let nextMessages = state.messages
      const order = nextOrders.find((o) => o.id === orderId)
      if (order) {
        let category: MessageCategory = 'trip'
        let title = ''
        let content = ''
        if (update.type === 'text') {
          if (update.content.startsWith('【就诊进展】')) {
            category = 'trip'
            title = '就诊进度更新'
            content = `${order.companionName}反馈：${update.content}`
          } else if (update.content.includes('完成') || update.content.includes('签到')) {
            category = 'trip'
            title = '就诊节点更新'
            content = `${order.companionName}：${update.content}`
          } else if (update.content.includes('祝')) {
            category = 'system'
            title = '陪诊服务结束'
            content = update.content
          } else {
            category = 'trip'
            title = `${order.companionName}发来文字消息`
            content = update.content
          }
        } else {
          category = 'trip'
          title = '收到现场照片'
          content = `${order.companionName}上传了1张现场照片，点击查看详情。`
        }
        nextMessages = _pushMessage(
          { messages: state.messages, orders: nextOrders },
          { orderId, category, title, content }
        )
      }

      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 服务更新已添加:', orderId, update.type)
  },

  completeService: (orderId) => {
    const state = get()
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return

    const finalProgress: ServiceProgress[] = [
      { id: 'p1', title: '陪诊员已到达', description: '已和就诊人碰面', time: order.serviceProgress?.[0]?.time || '08:15', status: 'done' },
      { id: 'p2', title: '签到取号', description: '已完成挂号签到', time: order.serviceProgress?.[1]?.time || '08:35', status: 'done' },
      { id: 'p3', title: '医生问诊', description: '已完成问诊', time: timeStr(), status: 'done' },
      { id: 'p4', title: '缴费取药', description: '已完成缴费取药', time: timeStr(), status: 'done' },
      { id: 'p5', title: '检查/化验', description: '所有检查完成', time: timeStr(), status: 'done' },
      { id: 'p6', title: '服务完成', description: '就诊结束，服务完成', time: timeStr(), status: 'done' }
    ]

    const finalReminders: CheckReminder[] | undefined = order.checkReminders?.map((r) => ({
      ...r,
      completed: true
    }))

    set((s) => {
      const nextOrders = s.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'completed', serviceProgress: finalProgress, checkReminders: finalReminders }
          : o
      )
      let nextMessages = _pushMessage(
        { messages: s.messages, orders: nextOrders },
        {
          orderId,
          category: 'doctor',
          title: '医生建议摘要',
          content: `根据${order.department}医生诊断，${order.patient.name}本次就诊建议遵医嘱按时服药、注意休息、清淡饮食。如有不适请及时复诊。`,
          extra: { diagnosis: '遵医嘱复诊', suggestion: '用药+休息' }
        }
      )
      nextMessages = _pushMessage(
        { messages: nextMessages, orders: nextOrders },
        {
          orderId,
          category: 'medicine',
          title: '用药注意事项',
          content: `请提醒${order.patient.name}按处方说明服药，服药期间避免辛辣刺激饮食，如有不良反应请及时就医。`
        }
      )
      const nextVisit = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      const nvStr = `${nextVisit.getFullYear()}-${String(nextVisit.getMonth() + 1).padStart(2, '0')}-${String(nextVisit.getDate()).padStart(2, '0')}`
      nextMessages = _pushMessage(
        { messages: nextMessages, orders: nextOrders },
        {
          orderId,
          category: 'followup',
          title: '复诊提醒',
          content: `建议${order.patient.name}两周后（${nvStr}）复诊，复查相关指标。请提前预约${order.hospital}${order.department}。`,
          extra: { nextVisit: nvStr }
        }
      )
      nextMessages = _pushMessage(
        { messages: nextMessages, orders: nextOrders },
        {
          orderId,
          category: 'trip',
          title: '陪诊服务完成',
          content: `${order.patient.name}今日就诊已全部完成，您可以评价陪诊员${order.companionName}，也可以申请电子发票。`
        }
      )
      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 服务完成:', orderId, '→ completed')
  },

  markMessageRead: (msgId) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === msgId ? { ...m, read: true } : m))
    }))
  },

  markAllMessagesRead: () => {
    set((state) => ({ messages: state.messages.map((m) => ({ ...m, read: true })) }))
  },

  applyInvoice: (params) => {
    const invoiceId = genId('inv')
    set((state) => {
      const nextOrders = state.orders.map((o) => {
        if (params.orderIds.includes(o.id)) {
          return { ...o, invoiceStatus: 'pending' as InvoiceStatus, invoiceId }
        }
        return o
      })
      let nextMessages = state.messages
      params.orderIds.forEach((orderId) => {
        const order = nextOrders.find((o) => o.id === orderId)
        if (order) {
          nextMessages = _pushMessage(
            { messages: nextMessages, orders: nextOrders },
            {
              orderId,
              category: 'system',
              title: '发票申请已提交',
              content: `订单${order.orderNo}的电子发票申请已提交，金额¥${order.totalAmount}.00，预计1-3个工作日内发送至邮箱${params.email}。`
            }
          )
        }
      })
      return { orders: nextOrders, messages: nextMessages }
    })
    console.log('[Store] 发票申请已提交:', invoiceId, params.orderIds)
    return invoiceId
  },

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId)
}))
