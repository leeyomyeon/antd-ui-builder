export const OVERLAY_COMPONENTS = [
  {
    type: 'Alert',
    label: 'Alert',
    defaultProps: { message: '알림 메시지', description: '상세 내용', type: 'info', showIcon: true, closable: true },
    position: 'top', // 상단 고정
  },
  {
    type: 'Alert.Success',
    label: 'Alert (Success)',
    defaultProps: { message: '성공', description: '작업이 완료되었습니다.', type: 'success', showIcon: true, closable: true },
    position: 'top',
  },
  {
    type: 'Alert.Error',
    label: 'Alert (Error)',
    defaultProps: { message: '오류', description: '문제가 발생했습니다.', type: 'error', showIcon: true, closable: true },
    position: 'top',
  },
  {
    type: 'Spin',
    label: 'Spin (전체화면)',
    defaultProps: { tip: '로딩 중...', size: 'large' },
    position: 'fullscreen',
  },
  {
    type: 'Modal',
    label: 'Modal',
    defaultProps: { title: '모달 제목', children: '모달 내용입니다.' },
    position: 'center',
  },
  {
    type: 'Drawer.Right',
    label: 'Drawer (우측)',
    defaultProps: { title: '드로어', placement: 'right', children: '드로어 내용입니다.' },
    position: 'drawer',
  },
  {
    type: 'Drawer.Left',
    label: 'Drawer (좌측)',
    defaultProps: { title: '드로어', placement: 'left', children: '드로어 내용입니다.' },
    position: 'drawer',
  },
  {
    type: 'Drawer.Bottom',
    label: 'Drawer (하단)',
    defaultProps: { title: '드로어', placement: 'bottom', children: '드로어 내용입니다.', height: 300 },
    position: 'drawer',
  },
]