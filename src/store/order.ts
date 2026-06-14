import { create } from 'zustand'
import type { Order, OrderStatus, Patient, ServiceUpdate, ServiceProgress, CheckReminder } from '@/types'
import { orders as mockOrders } from '@/data/orders'

interface OrderStore {
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createTime' | 'status' | 'paidAmount'> & { patient: Patient }) => string
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  addServiceUpdate: (orderId: string, update: Omit<ServiceUpdate, 'id' | 'time'>) => void
  completeService: (orderId: string) => void
  rescheduleOrder: (orderId: string, newDate: string, newTime: string) => void
  cancelOrder: (orderId: string) => void
  supplementInfo: (orderId: string, info: { healthNotes?: string; idCard?: string; extraNotes?: string }) => void
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
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

const timeStr = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [...mockOrders],

  addOrder: (data) => {
    const orderId = genId('o')
    const newOrder: Order = {
      id: orderId,
      orderNo: genOrderNo(),
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
      createTime: nowStr()
    }
    set((state) => ({ orders: [newOrder, ...state.orders] }))
    console.log('[Store] 订单已创建:', orderId, newOrder.orderNo)
    return orderId
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o))
    }))
    console.log('[Store] 订单状态更新:', orderId, '→', status)
  },

  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    }))
  },

  addServiceUpdate: (orderId, update) => {
    set((state) => ({
      orders: state.orders.map((o) => {
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
    }))
    console.log('[Store] 服务更新已添加:', orderId, update.type)
  },

  completeService: (orderId) => {
    const state = get()
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return

    const finalProgress: ServiceProgress[] = [
      { id: 'p1', title: '陪诊员已到达', description: '已和就诊人碰面', time: (order.serviceProgress?.[0]?.time) || '08:15', status: 'done' },
      { id: 'p2', title: '签到取号', description: '已完成挂号签到', time: (order.serviceProgress?.[1]?.time) || '08:35', status: 'done' },
      { id: 'p3', title: '医生问诊', description: '已完成问诊', time: timeStr(), status: 'done' },
      { id: 'p4', title: '缴费取药', description: '已完成缴费取药', time: timeStr(), status: 'done' },
      { id: 'p5', title: '检查/化验', description: '所有检查完成', time: timeStr(), status: 'done' },
      { id: 'p6', title: '服务完成', description: '就诊结束，服务完成', time: timeStr(), status: 'done' }
    ]

    const finalReminders: CheckReminder[] | undefined = order.checkReminders?.map((r) => ({
      ...r,
      completed: true
    }))

    set({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'completed', serviceProgress: finalProgress, checkReminders: finalReminders }
          : o
      )
    })
    console.log('[Store] 服务完成:', orderId, '→ completed')
  },

  rescheduleOrder: (orderId, newDate, newTime) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, appointmentDate: newDate, appointmentTime: newTime }
          : o
      )
    }))
    console.log('[Store] 改期成功:', orderId, newDate, newTime)
  },

  cancelOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    }))
    console.log('[Store] 订单取消:', orderId)
  },

  supplementInfo: (orderId, info) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o
        const newPatient = {
          ...o.patient,
          healthNotes: info.healthNotes || o.patient.healthNotes,
          idCard: info.idCard || o.patient.idCard
        }
        const notesExtra = info.extraNotes
          ? (o.conditionNotes ? `${o.conditionNotes} | 补充：${info.extraNotes}` : `补充：${info.extraNotes}`)
          : o.conditionNotes
        return { ...o, patient: newPatient, conditionNotes: notesExtra }
      })
    }))
    console.log('[Store] 资料已补充:', orderId)
  },

  getOrder: (orderId) => {
    return get().orders.find((o) => o.id === orderId)
  }
}))
