export const COMPONENT_PALETTE = [
  {
    category: '컨테이너',
    items: [
      { type: 'Container', label: 'Container', defaultW: 8, defaultH: 6, props: { children: [] } },
      { type: 'TableContainer', label: 'Table (커스텀)', defaultW: 12, defaultH: 10, props: { columns: ['컬럼1', '컬럼2', '컬럼3'], rows: 3, children: [] } },
    ]
  },
  {
    category: '입력',
    items: [
      { type: 'Input', label: 'Input', defaultW: 6, defaultH: 2, props: { placeholder: '텍스트 입력' } },
      { type: 'Input.Password', label: 'Password', defaultW: 6, defaultH: 2, props: { placeholder: '비밀번호' } },
      { type: 'Input.TextArea', label: 'TextArea', defaultW: 6, defaultH: 4, props: { placeholder: '여러 줄 입력', rows: 3 } },
      { type: 'InputNumber', label: 'InputNumber', defaultW: 4, defaultH: 2, props: { placeholder: '숫자 입력' } },
      { type: 'Select', label: 'Select', defaultW: 5, defaultH: 2, props: { placeholder: '선택', options: [{ value: '1', label: '옵션 1' }, { value: '2', label: '옵션 2' }] } },
      { type: 'DatePicker', label: 'DatePicker', defaultW: 5, defaultH: 2, props: {} },
      { type: 'Checkbox', label: 'Checkbox', defaultW: 4, defaultH: 2, props: { children: '체크박스' } },
      { type: 'Radio.Group', label: 'Radio Group', defaultW: 6, defaultH: 2, props: { options: ['옵션A', '옵션B', '옵션C'] } },
      { type: 'Switch', label: 'Switch', defaultW: 3, defaultH: 2, props: {} },
      { type: 'Slider', label: 'Slider', defaultW: 6, defaultH: 2, props: { defaultValue: 30 } },
    ]
  },
  {
    category: '버튼',
    items: [
      { type: 'Button', label: 'Button', defaultW: 3, defaultH: 2, props: { children: '버튼', type: 'primary' } },
      { type: 'Button.Default', label: 'Button (Default)', defaultW: 3, defaultH: 2, props: { children: '버튼' } },
      { type: 'Button.Danger', label: 'Button (Danger)', defaultW: 3, defaultH: 2, props: { children: '삭제', danger: true } },
    ]
  },
  {
    category: '데이터 표시',
    items: [
      { type: 'Table', label: 'Table (고정)', defaultW: 12, defaultH: 6, props: {} },
      { type: 'List', label: 'List', defaultW: 6, defaultH: 6, props: {} },
      { type: 'Card', label: 'Card', defaultW: 6, defaultH: 5, props: { title: '카드 제목' } },
      { type: 'Tag', label: 'Tag', defaultW: 3, defaultH: 2, props: { children: '태그', color: 'blue' } },
      { type: 'Badge', label: 'Badge', defaultW: 3, defaultH: 2, props: { count: 5 } },
      { type: 'Avatar', label: 'Avatar', defaultW: 3, defaultH: 2, props: {} },
    ]
  },
  {
    category: '피드백',
    items: [
      { type: 'Alert', label: 'Alert', defaultW: 8, defaultH: 3, props: { message: '알림 메시지', type: 'info', showIcon: true } },
      { type: 'Progress', label: 'Progress', defaultW: 6, defaultH: 2, props: { percent: 60 } },
      { type: 'Spin', label: 'Spin', defaultW: 3, defaultH: 3, props: {} },
    ]
  },
  {
    category: '레이아웃',
    items: [
      { type: 'Divider', label: 'Divider', defaultW: 12, defaultH: 1, props: {} },
      { type: 'Typography.Title', label: 'Title', defaultW: 8, defaultH: 2, props: { children: '제목', level: 3 } },
      { type: 'Typography.Text', label: 'Text', defaultW: 6, defaultH: 2, props: { children: '텍스트 내용' } },
    ]
  },
]