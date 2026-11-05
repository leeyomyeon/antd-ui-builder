import { find, getSpan, initMerges, cellKey } from './mergeUtils'

const IMPORT_MAP = {
  'Input': 'Input', 'Input.Password': 'Input', 'Input.TextArea': 'Input',
  'InputNumber': 'InputNumber', 'Select': 'Select', 'DatePicker': 'DatePicker',
  'Checkbox': 'Checkbox', 'Radio.Group': 'Radio', 'Switch': 'Switch', 'Slider': 'Slider',
  'Button': 'Button', 'Button.Default': 'Button', 'Button.Danger': 'Button',
  'Table': 'Table', 'List': 'List', 'Card': 'Card',
  'Tag': 'Tag', 'Badge': 'Badge', 'Avatar': 'Avatar',
  'Alert': 'Alert', 'Progress': 'Progress', 'Spin': 'Spin',
  'Divider': 'Divider', 'Typography.Title': 'Typography', 'Typography.Text': 'Typography',
}

function propsToString(props) {
  if (!props || Object.keys(props).length === 0) return ''
  return Object.entries(props)
    .filter(([key]) => !['children', 'columns', 'rows'].includes(key))
    .map(([key, val]) => {
      if (typeof val === 'string') return `${key}="${val}"`
      if (typeof val === 'boolean') return val ? key : `${key}={false}`
      if (Array.isArray(val)) return `${key}={${JSON.stringify(val)}}`
      return `${key}={${JSON.stringify(val)}}`
    })
    .join(' ')
}

function collectImports(items, set = new Set()) {
  items.forEach(item => {
    const imp = IMPORT_MAP[item.type]
    if (imp) set.add(imp)
    if (item.children?.length) collectImports(item.children, set)
    if (item.cellChildren) {
      Object.values(item.cellChildren).forEach(children => {
        if (children?.length) collectImports(children, set)
      })
    }
  })
  return set
}

// 캔버스(renderComponent)에서 width: 100%로 그리는 컴포넌트 — 생성 코드도 같은 폭이 되도록
const FULL_WIDTH_TYPES = ['Select', 'InputNumber', 'DatePicker']

function simpleComponentJSX(type, props, indent) {
  const widthStyle = FULL_WIDTH_TYPES.includes(type) && !props?.style ? `style={{ width: '100%' }}` : ''
  const propsStr = [propsToString(props), widthStyle].filter(Boolean).join(' ')
  const sp = propsStr ? ' ' : ''
  if (props?.children && typeof props.children === 'string') {
    return `${indent}<${type}${sp}${propsStr}>${props.children}</${type}>`
  }
  return `${indent}<${type}${sp}${propsStr} />`
}

const GRID_COLS = 12

// 구간 [start, end)가 겹치는 아이템끼리 묶음 (axis: 'y' → 같은 줄, 'x' → 같은 열)
function groupByAxis(items, axis) {
  const size = axis === 'y' ? 'h' : 'w'
  const sorted = [...items].sort((a, b) => a.layout[axis] - b.layout[axis])
  const groups = []
  sorted.forEach(item => {
    const start = item.layout[axis]
    const end = start + item.layout[size]
    const last = groups[groups.length - 1]
    if (last && start < last.end) {
      last.items.push(item)
      last.end = Math.max(last.end, end)
    } else {
      groups.push({ start, end, items: [item] })
    }
  })
  return groups
}

// 그리드 칸 → antd 24 span (누적 반올림으로 한 Row 합계가 24를 넘지 않게)
function toSpan(pos, cols) {
  return Math.round((pos / cols) * 24)
}

// bare: 부모가 일반 블록일 때만 전체 폭 아이템을 감싸지 않고 그대로 출력
function rowJSX(groups, indent, cols, bare) {
  const only = groups.length === 1 && groups[0].items.length === 1 ? groups[0] : null
  if (only && only.start === 0 && only.end === cols) {
    if (bare) return itemToJSX(only.items[0], indent)
    // Flex 세로 정렬 안에서 Button/Switch 등이 늘어나지 않도록 div로 감쌈
    return [`${indent}<div>`, itemToJSX(only.items[0], indent + '  '), `${indent}</div>`].join('\n')
  }

  const i1 = indent + '  '
  const i2 = i1 + '  '
  let prevEnd = 0
  const colsJSX = groups.map(group => {
    const span = toSpan(group.end, cols) - toSpan(group.start, cols)
    const offset = toSpan(group.start, cols) - toSpan(prevEnd, cols)
    prevEnd = group.end
    // 같은 열에 세로로 쌓인 아이템은 열 너비 기준으로 다시 배치
    const inner = group.items.length === 1
      ? itemToJSX(group.items[0], i2)
      : gridJSX(
          group.items.map(it => ({ ...it, layout: { ...it.layout, x: it.layout.x - group.start } })),
          i2, group.end - group.start
        )
    return [
      `${i1}<Col span={${span}}${offset > 0 ? ` offset={${offset}}` : ''}>`,
      inner,
      `${i1}</Col>`,
    ].join('\n')
  })
  return [`${indent}<Row gutter={[8, 8]}>`, ...colsJSX, `${indent}</Row>`].join('\n')
}

// 세로 줄 단위로 나눈 뒤, 각 줄을 가로 열 그룹 목록으로 반환
function splitRows(items) {
  const bands = groupByAxis(items, 'y')
  if (bands.length > 1) return bands.flatMap(band => splitRows(band.items))
  const groups = groupByAxis(items, 'x')
  // 더 이상 가로/세로로 나눌 수 없는 배치는 한 줄에 하나씩 쌓음
  if (groups.length === 1 && items.length > 1) {
    return [...items]
      .sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x)
      .map(it => [{ start: it.layout.x, end: it.layout.x + it.layout.w, items: [it] }])
  }
  return [groups]
}

// react-grid-layout 배치(x, y, w, h)를 Row/Col 구조로 변환
function gridJSX(items, indent, cols = GRID_COLS) {
  if (!items?.length) return ''
  const rows = splitRows(items)
  if (rows.length === 1) return rowJSX(rows[0], indent, cols, true)
  // 줄 사이 간격은 캔버스 margin(8px)과 맞춤
  return [
    `${indent}<Flex vertical gap={8}>`,
    ...rows.map(groups => rowJSX(groups, indent + '  ', cols, false)),
    `${indent}</Flex>`,
  ].join('\n')
}

function nestedItemsJSX(children, indent) {
  return gridJSX(children, indent)
}

function tableContainerJSX(item, indent) {
  const cols = item.props.columns || []
  const rows = item.props.rows || 3
  const cellChildren = item.cellChildren || {}
  const merges = item.merges && Object.keys(item.merges).length > 0
    ? item.merges
    : initMerges(rows, cols.length)

  const i1 = indent + '  '
  const i2 = i1 + '  '
  const i3 = i2 + '  '
  const i4 = i3 + '  '
  const i5 = i4 + '  '

  const renderedCells = new Set()

  const theadCols = cols.map(col =>
    `${i4}<th style={{ padding: '6px 10px', textAlign: 'left' }}>${col}</th>`
  ).join('\n')

  const tbodyRows = Array.from({ length: rows }).map((_, rowIdx) => {
    const cells = cols.map((_, colIdx) => {
      const key = cellKey(rowIdx, colIdx)
      const root = find(merges, key)
      if (root !== key || renderedCells.has(key)) {
        renderedCells.add(key)
        return null
      }
      renderedCells.add(key)

      const { rowSpan, colSpan } = getSpan(merges, root)
      const spanProps = [
        rowSpan > 1 ? `rowSpan={${rowSpan}}` : '',
        colSpan > 1 ? `colSpan={${colSpan}}` : '',
      ].filter(Boolean).join(' ')

      const cellContent = cellChildren[key]
      const inner = cellContent?.length
        ? '\n' + nestedItemsJSX(cellContent, i5) + '\n' + i4
        : ''

      return `${i4}<td${spanProps ? ' ' + spanProps : ''} style={{ verticalAlign: 'top', padding: 4 }}>${inner}</td>`
    }).filter(Boolean).join('\n')

    return `${i3}<tr>\n${cells}\n${i3}</tr>`
  }).join('\n')

  return [
    `${indent}<table style={{ width: '100%', borderCollapse: 'collapse' }}>`,
    `${i1}<thead>`,
    `${i2}<tr>`,
    theadCols,
    `${i2}</tr>`,
    `${i1}</thead>`,
    `${i1}<tbody>`,
    tbodyRows,
    `${i1}</tbody>`,
    `${indent}</table>`,
  ].join('\n')
}

function itemToJSX(item, indent = '      ') {
  const { type, props = {}, children = [] } = item

  if (type === 'Container') {
    const inner = children.length
      ? '\n' + nestedItemsJSX(children, indent + '  ') + '\n' + indent
      : ''
    return `${indent}<div style={{ padding: 16, position: 'relative', minHeight: 200 }}>${inner}</div>`
  }

  if (type === 'TableContainer') {
    return tableContainerJSX(item, indent)
  }

  return simpleComponentJSX(type, props, indent)
}

function layoutTemplateJSX(template, layoutChildren, indent = '    ') {
  if (!template) return ''

  const { rows, cols } = template
  const merges = template.merges && Object.keys(template.merges).length > 0
    ? template.merges
    : initMerges(rows, cols)

  const i1 = indent + '  '
  const i2 = i1 + '  '
  const i3 = i2 + '  '
  const i4 = i3 + '  '

  const renderedCells = new Set()

  const rowsJSX = Array.from({ length: rows }).map((_, rowIdx) => {
    const cells = Array.from({ length: cols }).map((_, colIdx) => {
      const key = cellKey(rowIdx, colIdx)
      const root = find(merges, key)
      if (root !== key || renderedCells.has(key)) {
        renderedCells.add(key)
        return null
      }
      renderedCells.add(key)

      const { rowSpan, colSpan } = getSpan(merges, root)
      const title = template.cellTitles?.[key] || key
      const span = Math.round((colSpan / cols) * 24)

      const childrenKey = `${template.id}-${key}`
      const children = layoutChildren[childrenKey] || []
      const inner = children.length
        ? '\n' + nestedItemsJSX(children, i4 + '  ') + '\n' + i4
        : ''

      const colProps = [
        `span={${span}}`,
        rowSpan > 1 ? `// rowSpan=${rowSpan} (별도 처리 필요)` : '',
      ].filter(Boolean).join(' ')

      return [
        `${i3}<Col ${colProps}>`,
        `${i4}<Card title="${title}">${inner}</Card>`,
        `${i3}</Col>`,
      ].join('\n')
    }).filter(Boolean).join('\n')

    return [
      `${i2}<Row gutter={[16, 16]}>`,
      cells,
      `${i2}</Row>`,
    ].join('\n')
  }).join('\n')

  return [
    `${indent}{/* ${template.name} */}`,
    rowsJSX,
  ].join('\n')
}

function stateVarName(overlay) {
  return `show${overlay.type.replace('.', '')}`
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateCode(items, overlays = [], selectedTemplate = null, layoutChildren = {}) {
  const usedImports = collectImports(items)

  if (selectedTemplate) {
    usedImports.add('Row')
    usedImports.add('Col')
    usedImports.add('Card')
    Object.keys(layoutChildren)
      .filter(key => key.startsWith(`${selectedTemplate.id}-`))
      .forEach(key => collectImports(layoutChildren[key], usedImports))
  }

  overlays.forEach(o => {
    const base = o.type.split('.')[0]
    if (base === 'Alert') usedImports.add('Alert')
    if (base === 'Spin') usedImports.add('Spin')
    if (base === 'Modal') usedImports.add('Modal')
    if (base === 'Drawer') usedImports.add('Drawer')
  })

  if (items.length === 0 && overlays.length === 0 && !selectedTemplate) {
    return `// 왼쪽 팔레트에서 컴포넌트를 드래그하세요`
  }

  const layoutCode = selectedTemplate
    ? layoutTemplateJSX(selectedTemplate, layoutChildren) + '\n'
    : ''

  const componentLines = gridJSX(items, '      ')

  if (/<Col[ >]/.test(layoutCode + componentLines)) {
    usedImports.add('Row')
    usedImports.add('Col')
  }
  if (/<Flex[ >]/.test(layoutCode + componentLines)) usedImports.add('Flex')

  const importLine = usedImports.size
    ? `import { ${[...usedImports].sort().join(', ')} } from 'antd'`
    : ''

  const overlayStates = overlays.map(o =>
    `  const [${stateVarName(o)}, set${capitalize(stateVarName(o))}] = useState(false)`
  ).join('\n')

  const overlayJSX = overlays.map(o => {
    const varName = stateVarName(o)
    const setter = `set${capitalize(varName)}`
    const { children, ...rest } = o.props
    const propsStr = Object.entries(rest)
      .filter(([k]) => !['columns', 'rows'].includes(k))
      .map(([k, v]) => typeof v === 'string' ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`)
      .join(' ')
    const base = o.type.split('.')[0]
    if (base === 'Alert') return `      {${varName} && <Alert ${propsStr} onClose={() => ${setter}(false)} />}`
    if (base === 'Spin') return `      <Spin spinning={${varName}} ${propsStr} fullscreen />`
    if (base === 'Modal') return `      <Modal open={${varName}} ${propsStr} onCancel={() => ${setter}(false)} onOk={() => ${setter}(false)}>${children || ''}</Modal>`
    if (base === 'Drawer') return `      <Drawer open={${varName}} ${propsStr} onClose={() => ${setter}(false)}>${children || ''}</Drawer>`
    return ''
  }).filter(Boolean).join('\n')

  const hasOverlays = overlays.length > 0

  return `import React${hasOverlays ? ', { useState }' : ''} from 'react'
${importLine}

export default function MyPage() {
${overlayStates ? overlayStates + '\n' : ''}
  return (
    <div style={{ padding: 24 }}>
${layoutCode}${componentLines}
${overlayJSX}
    </div>
  )
}`
}