// 컴포넌트 타입별 세로 크기 규칙 (그리드 행 단위)
// - fill: 아이템 높이를 채우는 타입 (생성 코드에도 높이를 반영)
// - minH: 내용이 잘리지 않는 최소 높이
// - maxH: 높이가 정해진 컨트롤은 의미 없이 늘어나지 않게 잠금
const FIXED_CONTROL = { minH: 2, maxH: 2 }

export const SIZE_RULES = {
  'Input': FIXED_CONTROL,
  'Input.Password': FIXED_CONTROL,
  'InputNumber': FIXED_CONTROL,
  'Select': FIXED_CONTROL,
  'DatePicker': FIXED_CONTROL,
  'Checkbox': FIXED_CONTROL,
  'Radio.Group': FIXED_CONTROL,
  'Switch': FIXED_CONTROL,
  'Slider': FIXED_CONTROL,
  'Button': FIXED_CONTROL,
  'Button.Default': FIXED_CONTROL,
  'Button.Danger': FIXED_CONTROL,
  'Tag': FIXED_CONTROL,
  'Badge': FIXED_CONTROL,
  'Avatar': FIXED_CONTROL,
  'Progress': FIXED_CONTROL,
  'Typography.Text': FIXED_CONTROL,
  'Typography.Title': { minH: 2, maxH: 3 },
  'Divider': { minH: 1, maxH: 1 },
  'Spin': { minH: 2, maxH: 4 },
  'Alert': { minH: 2, maxH: 4 },
  'Input.TextArea': { minH: 2, fill: true },
  'Card': { minH: 3, fill: true },
  'List': { minH: 4, fill: true },
  'Table': { minH: 4, fill: true },
  'Container': { minH: 4 },
  'TableContainer': { minH: 4 },
}

export function getSizeRule(type) {
  return SIZE_RULES[type] || {}
}

// RGL 레이아웃 아이템에 minH/maxH를 붙이고, 범위를 벗어난 기존 높이(저장된 프로젝트 등)는 보정
export function applySizeRule(layout, type) {
  const { minH, maxH } = getSizeRule(type)
  let h = layout.h
  if (minH != null) h = Math.max(h, minH)
  if (maxH != null) h = Math.min(h, maxH)
  return { ...layout, h, minH, maxH }
}

// 높이가 고정된 타입은 세로 방향 핸들(n, s 및 모서리의 세로 성분)을 빼서 가로 핸들만 표시
// 예: ['s','w','e','n','sw','nw','se','ne'] → ['w','e'],  ['se'] → ['e']
export function getResizeHandles(type, handles) {
  const { minH, maxH } = getSizeRule(type)
  if (minH == null || minH !== maxH) return handles
  return [...new Set(handles.map(h => h.replace(/[ns]/g, '')).filter(Boolean))]
}

// 팔레트 기본 높이도 규칙 범위 안으로
export function clampDefaultH(type, h) {
  return applySizeRule({ h }, type).h
}

// 캔버스 아이템 크기 → 컴포넌트가 실제로 차지하는 높이(px)
// rowHeight/margin은 GridLayout 설정, chrome은 아이템 테두리·라벨 영역(상하 padding + border)
export const MAIN_GRID = { rowHeight: 40, marginY: 8, chrome: 32 }
export const NESTED_GRID = { rowHeight: 36, marginY: 6, chrome: 26 }

export function contentHeight(h, grid = MAIN_GRID) {
  return Math.max(0, h * grid.rowHeight + (h - 1) * grid.marginY - grid.chrome)
}
