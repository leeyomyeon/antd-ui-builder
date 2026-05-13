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

function simpleComponentJSX(type, props, indent) {
  const propsStr = propsToString(props)
  const sp = propsStr ? ' ' : ''
  if (props?.children && typeof props.children === 'string') {
    return `${indent}<${type}${sp}${propsStr}>${props.children}</${type}>`
  }
  return `${indent}<${type}${sp}${propsStr} />`
}

function nestedItemsJSX(children, indent) {
  if (!children?.length) return ''
  const sorted = [...children].sort((a, b) => {
    if (a.layout.y !== b.layout.y) return a.layout.y - b.layout.y
    return a.layout.x - b.layout.x
  })
  return sorted.map(c => simpleComponentJSX(c.type, c.props, indent)).join('\n')
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
    return `${indent}<div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 6 }}>${inner}</div>`
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
    selectedTemplate.rows.forEach(row => {
      row.cols.forEach(col => {
        const key = `${selectedTemplate.id}-${col.id}`
        const children = layoutChildren[key] || []
        collectImports(children, usedImports)
      })
    })
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

  const importLine = usedImports.size
    ? `import { ${[...usedImports].sort().join(', ')} } from 'antd'`
    : ''

  const sorted = [...items].sort((a, b) => {
    if (a.layout.y !== b.layout.y) return a.layout.y - b.layout.y
    return a.layout.x - b.layout.x
  })

  const layoutCode = selectedTemplate
    ? layoutTemplateJSX(selectedTemplate, layoutChildren) + '\n'
    : ''

  const componentLines = sorted.map(item => itemToJSX(item)).join('\n')

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