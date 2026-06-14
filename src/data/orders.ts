import type { Order } from '@/types'

export const orders: Order[] = [
  {
    id: 'o1',
    orderNo: 'PZ202606140001',
    companionId: 'c1',
    companionName: '李阿姨',
    companionAvatar: 'https://picsum.photos/id/64/200/200',
    patient: {
      name: '王奶奶',
      gender: 'female',
      age: 72,
      phone: '138****5678',
      healthNotes: '高血压、糖尿病'
    },
    hospital: '北京协和医院',
    department: '内科',
    appointmentDate: '2026-06-14',
    appointmentTime: '08:30',
    meetingPoint: '医院东门',
    estimatedDuration: 4,
    conditionNotes: '最近血压偏高，需要复查并调整用药，有头晕症状',
    status: 'in_service',
    totalAmount: 320,
    paidAmount: 320,
    createTime: '2026-06-12 15:30:00',
    serviceProgress: [
      { id: 'p1', title: '陪诊员已到达', description: '李阿姨已到达医院东门等候', time: '08:15', status: 'done' },
      { id: 'p2', title: '签到取号', description: '已完成挂号签到，等待叫号', time: '08:35', status: 'done' },
      { id: 'p3', title: '医生问诊', description: '正在内科3诊室就诊', time: '09:10', status: 'current' },
      { id: 'p4', title: '缴费取药', description: '待完成', time: '', status: 'pending' },
      { id: 'p5', title: '检查/化验', description: '待完成', time: '', status: 'pending' },
      { id: 'p6', title: '服务完成', description: '待完成', time: '', status: 'pending' }
    ],
    checkReminders: [
      { id: 'r1', title: '血常规检查', type: 'check', time: '09:30', completed: false, note: '空腹抽血' },
      { id: 'r2', title: '心电图检查', type: 'check', time: '10:00', completed: false },
      { id: 'r3', title: '取降压药', type: 'medicine', time: '11:00', completed: false }
    ],
    updates: [
      { id: 'u1', type: 'text', content: '已和王奶奶碰面，状态良好', time: '08:20' },
      { id: 'u2', type: 'image', content: 'https://picsum.photos/id/431/600/400', time: '08:45' },
      { id: 'u3', type: 'text', content: '已签到，前面还有5位患者', time: '08:50' }
    ]
  },
  {
    id: 'o2',
    orderNo: 'PZ202606150002',
    companionId: 'c4',
    companionName: '刘阿姨',
    companionAvatar: 'https://picsum.photos/id/338/200/200',
    patient: {
      name: '张女士',
      gender: 'female',
      age: 32,
      phone: '139****1234',
      healthNotes: '孕28周，一胎'
    },
    hospital: '北京朝阳医院',
    department: '妇产科',
    appointmentDate: '2026-06-15',
    appointmentTime: '09:00',
    meetingPoint: '门诊大厅导诊台',
    estimatedDuration: 3,
    conditionNotes: '常规产检，B超检查，近期有轻微水肿',
    status: 'confirmed',
    totalAmount: 255,
    paidAmount: 255,
    createTime: '2026-06-10 10:20:00'
  },
  {
    id: 'o3',
    orderNo: 'PZ202606100003',
    companionId: 'c2',
    companionName: '王姐',
    companionAvatar: 'https://picsum.photos/id/91/200/200',
    patient: {
      name: '李先生',
      gender: 'male',
      age: 58,
      phone: '136****9876',
      healthNotes: '冠心病'
    },
    hospital: '北京安贞医院',
    department: '心血管内科',
    appointmentDate: '2026-06-10',
    appointmentTime: '10:00',
    meetingPoint: '医院西门',
    estimatedDuration: 5,
    conditionNotes: '术后三个月复查，需做心电图和心脏彩超',
    status: 'completed',
    totalAmount: 350,
    paidAmount: 350,
    createTime: '2026-06-08 09:15:00'
  },
  {
    id: 'o4',
    orderNo: 'PZ202606080004',
    companionId: 'c3',
    companionName: '张大哥',
    companionAvatar: 'https://picsum.photos/id/177/200/200',
    patient: {
      name: '赵大爷',
      gender: 'male',
      age: 68,
      phone: '137****4321',
      healthNotes: '腰椎间盘突出'
    },
    hospital: '北京天坛医院',
    department: '骨科',
    appointmentDate: '2026-06-08',
    appointmentTime: '14:00',
    meetingPoint: '门诊一楼',
    estimatedDuration: 4,
    conditionNotes: '腰痛加重，行动不便，需做腰椎CT',
    status: 'cancelled',
    totalAmount: 360,
    paidAmount: 360,
    createTime: '2026-06-05 16:40:00'
  },
  {
    id: 'o5',
    orderNo: 'PZ202606160005',
    companionId: 'c6',
    companionName: '赵大哥',
    companionAvatar: 'https://picsum.photos/id/1012/200/200',
    patient: {
      name: '孙阿姨',
      gender: 'female',
      age: 65,
      phone: '135****8765',
      healthNotes: '脑梗后遗症'
    },
    hospital: '北京协和医院',
    department: '神经内科',
    appointmentDate: '2026-06-16',
    appointmentTime: '08:30',
    meetingPoint: '医院正门',
    estimatedDuration: 5,
    conditionNotes: '定期复查，需做头部MRI，行动需要搀扶',
    status: 'pending',
    totalAmount: 475,
    paidAmount: 0,
    createTime: '2026-06-13 11:30:00'
  }
]
