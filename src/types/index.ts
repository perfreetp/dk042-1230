export interface Companion {
  id: string
  name: string
  avatar: string
  gender: 'male' | 'female'
  age: number
  rating: number
  reviewCount: number
  orderCount: number
  experience: number
  serviceArea: string[]
  hospitals: string[]
  departments: string[]
  tags: string[]
  certifications: string[]
  serviceIntro: string
  pricePerHour: number
  availableDates: string[]
  availableSlots: string[]
}

export interface Hospital {
  id: string
  name: string
  level: string
  address: string
}

export interface Department {
  id: string
  name: string
}

export interface Patient {
  id?: string
  name: string
  gender: 'male' | 'female'
  age: number
  phone: string
  idCard?: string
  healthNotes?: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  orderNo: string
  companionId: string
  companionName: string
  companionAvatar: string
  patient: Patient
  hospital: string
  department: string
  appointmentDate: string
  appointmentTime: string
  meetingPoint: string
  estimatedDuration: number
  conditionNotes: string
  status: OrderStatus
  totalAmount: number
  paidAmount: number
  createTime: string
  serviceProgress?: ServiceProgress[]
  checkReminders?: CheckReminder[]
  updates?: ServiceUpdate[]
}

export interface ServiceProgress {
  id: string
  title: string
  description: string
  time: string
  status: 'done' | 'current' | 'pending'
}

export interface CheckReminder {
  id: string
  title: string
  type: 'check' | 'medicine' | 'other'
  time: string
  completed: boolean
  note?: string
}

export interface ServiceUpdate {
  id: string
  type: 'text' | 'image'
  content: string
  time: string
}

export type MessageCategory = 'trip' | 'doctor' | 'medicine' | 'followup' | 'system'

export interface Message {
  id: string
  category: MessageCategory
  title: string
  content: string
  time: string
  read: boolean
  orderId?: string
  extra?: Record<string, any>
}

export interface Review {
  id: string
  orderId: string
  companionId: string
  rating: number
  tags: string[]
  content: string
  images?: string[]
  createTime: string
}

export interface Invoice {
  id?: string
  type: 'personal' | 'company'
  title: string
  taxNo?: string
  email: string
  amount: number
  orderIds: string[]
  status?: 'pending' | 'issued' | 'failed'
}
