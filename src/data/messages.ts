import type { Message } from '@/types'

export const messages: Message[] = [
  {
    id: 'm1',
    category: 'trip',
    title: '陪诊员已到达医院',
    content: '李阿姨已于08:15到达北京协和医院东门，请您提醒王奶奶准时前往。',
    time: '2026-06-14 08:15',
    read: false,
    orderId: 'o1',
    extra: { location: '北京协和医院东门' }
  },
  {
    id: 'm2',
    category: 'trip',
    title: '已完成签到取号',
    content: '挂号签到成功，内科门诊3号诊室，前面还有5位患者等候。',
    time: '2026-06-14 08:35',
    read: false,
    orderId: 'o1',
    extra: { waiting: 5 }
  },
  {
    id: 'm3',
    category: 'doctor',
    title: '医生诊断建议摘要',
    content: '王奶奶血压150/95mmHg，医生建议调整降压药剂量，增加一种利尿剂。建议清淡饮食，定期监测血压。',
    time: '2026-06-14 09:30',
    read: false,
    orderId: 'o1',
    extra: {
      diagnosis: '高血压（2级）',
      suggestion: '调整用药 + 饮食控制'
    }
  },
  {
    id: 'm4',
    category: 'medicine',
    title: '用药注意事项',
    content: '新增药物：氢氯噻嗪片 25mg 每日一次晨服。注意：服用期间定期监测血钾，避免高盐饮食。',
    time: '2026-06-14 10:15',
    read: false,
    orderId: 'o1',
    extra: {
      medicines: [
        { name: '氢氯噻嗪片', dosage: '25mg', frequency: '每日一次' }
      ]
    }
  },
  {
    id: 'm5',
    category: 'followup',
    title: '复诊提醒',
    content: '建议王奶奶2周后（2026-06-28）复诊，复查血压和电解质。请提前预约挂号。',
    time: '2026-06-14 10:45',
    read: false,
    orderId: 'o1',
    extra: { nextVisit: '2026-06-28' }
  },
  {
    id: 'm6',
    category: 'trip',
    title: '明日就诊提醒',
    content: '张女士您好，明天（6月15日）09:00北京朝阳医院妇产科产检，刘阿姨将在门诊大厅导诊台等候。请携带产检手册和近期检查报告。',
    time: '2026-06-14 20:00',
    read: true,
    orderId: 'o2'
  },
  {
    id: 'm7',
    category: 'system',
    title: '订单待支付提醒',
    content: '您的订单 PZ202606160005 尚未支付，请在30分钟内完成支付，超时订单将自动取消。',
    time: '2026-06-13 11:35',
    read: true,
    orderId: 'o5'
  },
  {
    id: 'm8',
    category: 'system',
    title: '订单取消通知',
    content: '您的订单 PZ202606080004 已取消，退款360元将在1-3个工作日内原路退回。',
    time: '2026-06-07 14:20',
    read: true,
    orderId: 'o4'
  },
  {
    id: 'm9',
    category: 'doctor',
    title: '上次就诊检查报告已出',
    content: '李先生6月10日的心脏彩超报告已出：心功能正常，各瓣膜未见明显异常。详情可查看附件报告。',
    time: '2026-06-11 16:00',
    read: true,
    orderId: 'o3'
  },
  {
    id: 'm10',
    category: 'followup',
    title: '季度复诊提醒',
    content: '李先生距离上次冠心病术后复查已3个月，建议近期安排复查。推荐科室：心血管内科。',
    time: '2026-06-13 09:00',
    read: true,
    orderId: 'o3',
    extra: { nextVisit: '建议7月上旬' }
  }
]
