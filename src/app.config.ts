export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/orders/index',
    'pages/messages/index',
    'pages/mine/index',
    'pages/companion-detail/index',
    'pages/booking/index',
    'pages/order-detail/index',
    'pages/in-service/index',
    'pages/review/index',
    'pages/invoice/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2BA471',
    navigationBarTitleText: '陪诊通',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2BA471',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
