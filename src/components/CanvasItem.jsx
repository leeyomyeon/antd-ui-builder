import React, { useRef, useEffect, useState } from 'react'
import {
  Input, InputNumber, Select, DatePicker, Checkbox,
  Radio, Switch, Slider, Button, Table, List, Card,
  Tag, Badge, Avatar, Alert, Progress, Spin, Divider, Typography, Popover, Tooltip
} from 'antd'
import NestedCanvas from './NestedCanvas'
import {
  find, union, split, cellKey, getSpan, initMerges, canMerge, canMergeAll
} from '../utils/mergeUtils'

const { Title, Text } = Typography

function renderComponent(type, props) {
  const p = { ...props }
  delete p.children
  switch (type) {
    case 'Input': return <Input {...p} />
    case 'Input.Password': return <Input.Password {...p} />
    case 'Input.TextArea': return <Input.TextArea {...p} />
    case 'InputNumber': return <InputNumber style={{ width: '100%' }} {...p} />
    case 'Select': return <Select style={{ width: '100%' }} {...p} />
    case 'DatePicker': return <DatePicker style={{ width: '100%' }} {...p} />
    case 'Checkbox': return <Checkbox {...p}>{props.children}</Checkbox>
    case 'Radio.Group': return <Radio.Group {...p} />
    case 'Switch': return <Switch {...p} />
    case 'Slider': return <Slider {...p} />
    case 'Button': return <Button type="primary" {...p}>{props.children}</Button>
    case 'Button.Default': return <Button {...p}>{props.children}</Button>
    case 'Button.Danger': return <Button danger {...p}>{props.children}</Button>
    case 'Table': return (
      <Table size="small"
        dataSource={[{ key: 1, name: '홍길동', age: 30 }, { key: 2, name: '김철수', age: 25 }]}
        columns={[{ title: '이름', dataIndex: 'name' }, { title: '나이', dataIndex: 'age' }]}
        pagination={false} {...p} />
    )
    case 'List': return (
      <List size="small" dataSource={['항목 1', '항목 2', '항목 3']}
        renderItem={item => <List.Item>{item}</List.Item>} {...p} />
    )
    case 'Card': return <Card size="small" {...p}><Text type="secondary">카드 내용</Text></Card>
    case 'Tag': return <Tag {...p}>{props.children}</Tag>
    case 'Badge': return <Badge {...p}><Avatar shape="square">예시</Avatar></Badge>
    case 'Avatar': return <Avatar {...p}>U</Avatar>
    case 'Alert': return <Alert {...p} />
    case 'Progress': return <Progress {...p} />
    case 'Spin': return <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}><Spin {...p} /></div>
    case 'Divider': return <Divider {...p} />
    case 'Typography.Title': return <Title {...p}>{props.children}</Title>
    case 'Typography.Text': return <Text {...p}>{props.children}</Text>
    default: return <div style={{ color: '#666', fontSize: 12 }}>{type}</div>
  }
}

function TableSettings({ item, onUpdate }) {
  const cols = item.props.columns || []
  const rows = item.props.rows || 3
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', borderBottom: '1px solid #333', paddingBottom: 6 }}>
        Table 설정
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#888', width: 50, flexShrink: 0 }}>컬럼 수</span>
        <InputNumber size="small" min={1} max={10} value={cols.length}
          onChange={(val) => {
            const count = Math.max(1, Math.min(10, val || 1))
            const newCols = Array.from({ length: count }, (_, i) => cols[i] || `컬럼${i + 1}`)
            onUpdate({ ...item.props, columns: newCols })
          }}
          style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#888' }}>컬럼 이름</span>
        {cols.map((col, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#555', width: 14 }}>{i + 1}</span>
            <Input size="small" value={col}
              onChange={(e) => {
                const newCols = [...cols]
                newCols[i] = e.target.value
                onUpdate({ ...item.props, columns: newCols })
              }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#888', width: 50, flexShrink: 0 }}>행 수</span>
        <InputNumber size="small" min={1} max={20} value={rows}
          onChange={(val) => onUpdate({ ...item.props, rows: Math.max(1, Math.min(20, val || 1)) })}
          style={{ width: 60 }} />
      </div>
    </div>
  )
}

function TableBody({ item, onChildrenChange, onMergesChange, mergeMode }) {
  const cols = item.props.columns || []
  const rows = item.props.rows || 3
  const cellChildren = item.cellChildren || {}
  const merges = item.merges && Object.keys(item.merges).length > 0
    ? item.merges
    : initMerges(rows, cols.length)

  const [selected, setSelected] = useState([])

  const containerRef = useRef(null)
  const [innerWidth, setInnerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const o = new ResizeObserver(entries => {
      for (const entry of entries) setInnerWidth(entry.contentRect.width)
    })
    o.observe(containerRef.current)
    return () => o.disconnect()
  }, [])

  useEffect(() => {
    if (!mergeMode) setSelected([])
  }, [mergeMode])

  const colWidth = innerWidth ? innerWidth / cols.length : 100

  const handleCellClick = (e, key) => {
    if (!mergeMode) return
    e.stopPropagation()
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleMerge = () => {
    if (selected.length < 2) return
    // 선택된 셀들의 root를 모아서 순차 union
    let next = { ...merges }
    const roots = [...new Set(selected.map(k => find(next, k)))]
    for (let i = 1; i < roots.length; i++) {
      next = union(next, roots[0], roots[i])
    }
    onMergesChange(next)
    setSelected([])
  }

  const handleSplit = () => {
    if (selected.length === 0) return
    let next = { ...merges }
    selected.forEach(key => { next = split(next, key) })
    onMergesChange(next)
    setSelected([])
  }

  const canDoMerge = canMergeAll(merges, selected)

  const canDoSplit = selected.some(key => {
    const root = find(merges, key)
    const { rowSpan, colSpan } = getSpan(merges, root)
    return rowSpan > 1 || colSpan > 1
  })

  const renderedCells = new Set()

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {mergeMode && (
        <div style={{ display: 'flex', gap: 6, padding: '4px 2px 6px', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#6366f1', flex: 1 }}>
            {selected.length === 0 ? '병합할 셀을 클릭하세요' : `${selected.length}개 선택됨`}
          </span>
          <button onClick={handleMerge} disabled={!canDoMerge} style={{
            padding: '2px 8px', fontSize: 10, borderRadius: 3,
            cursor: canDoMerge ? 'pointer' : 'not-allowed',
            background: canDoMerge ? '#6366f1' : '#2a2a2a',
            color: canDoMerge ? '#fff' : '#555', border: 'none',
          }}>병합</button>
          <button onClick={handleSplit} disabled={!canDoSplit} style={{
            padding: '2px 8px', fontSize: 10, borderRadius: 3,
            cursor: canDoSplit ? 'pointer' : 'not-allowed',
            background: canDoSplit ? '#374151' : '#2a2a2a',
            color: canDoSplit ? '#d1d5db' : '#555', border: '1px solid #444',
          }}>분리</button>
          <button onClick={() => setSelected([])} style={{
            padding: '2px 8px', fontSize: 10, borderRadius: 3,
            cursor: 'pointer', background: 'transparent',
            color: '#555', border: '1px solid #333',
          }}>초기화</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          {cols.map((_, i) => <col key={i} style={{ width: `${100 / cols.length}%` }} />)}
        </colgroup>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {cols.map((_, colIdx) => {
                const key = cellKey(rowIdx, colIdx)
                const root = find(merges, key)
                if (root !== key || renderedCells.has(key)) {
                  renderedCells.add(key)
                  return null
                }
                renderedCells.add(key)

                const { rowSpan, colSpan } = getSpan(merges, root)
                const isSelected = selected.includes(key)
                const isMerged = rowSpan > 1 || colSpan > 1

                return (
                  <td
                    key={colIdx}
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                    onClick={(e) => handleCellClick(e, key)}
                    style={{
                      border: `1px solid ${isSelected ? '#6366f1' : '#2a2a2a'}`,
                      verticalAlign: 'top',
                      position: 'relative',
                      background: isSelected
                        ? 'rgba(99,102,241,0.12)'
                        : isMerged ? 'rgba(99,102,241,0.03)' : 'transparent',
                      cursor: mergeMode ? 'cell' : 'default',
                      minHeight: 44,
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    {isMerged && (
                      <div style={{
                        position: 'absolute', top: 2, right: 4,
                        fontSize: 9, color: '#6366f155',
                        pointerEvents: 'none', userSelect: 'none',
                      }}>
                        {rowSpan}×{colSpan}
                      </div>
                    )}
                    <div
                      style={{ pointerEvents: mergeMode ? 'none' : 'auto' }}
                      onMouseDown={(e) => { if (!mergeMode) e.stopPropagation() }}
                      onPointerDown={(e) => { if (!mergeMode) e.stopPropagation() }}
                    >
                      <NestedCanvas
                        containerId={`${item.id}-${key}`}
                        children={cellChildren[key] || []}
                        onChildrenChange={(children) => onChildrenChange(children, key)}
                        containerWidth={colWidth * colSpan - 4}
                      />
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CanvasItem({ item, onRemove, onChildrenChange, onPropsChange, onMergesChange, onMergeModeChange }) {
  const isContainer = item.type === 'Container' || item.type === 'TableContainer'
  const containerRef = useRef(null)
  const [innerWidth, setInnerWidth] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const mergeMode = item.mergeMode || false

  useEffect(() => {
    if (!isContainer || !containerRef.current) return
    const o = new ResizeObserver(entries => {
      for (const entry of entries) setInnerWidth(entry.contentRect.width)
    })
    o.observe(containerRef.current)
    return () => o.disconnect()
  }, [isContainer])

  return (
    <div style={{
      width: '100%', height: '100%',
      background: isContainer ? '#131320' : '#161616',
      border: `1px solid ${isContainer ? (mergeMode ? '#6366f166' : '#6366f133') : '#2a2a2a'}`,
      borderRadius: 6, overflow: 'hidden',
      position: 'relative', display: 'flex', flexDirection: 'column',
      padding: isContainer ? '22px 8px 8px' : '22px 10px 8px',
    }}>

      <div style={{
        position: 'absolute', top: 4,
        left: item.type === 'TableContainer' ? 56 : 8,
        fontSize: 9, color: isContainer ? '#6366f166' : '#444',
        letterSpacing: '0.05em', pointerEvents: 'none', userSelect: 'none',
      }}>
        {item.type}
      </div>

      {/* 설정 버튼 */}
      {item.type === 'TableContainer' && (
        <Popover
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          content={<TableSettings item={item} onUpdate={onPropsChange} />}
          trigger="click"
          placement="bottomLeft"
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 26, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 10, color: '#6366f1',
              borderRadius: '6px 0 4px 0', zIndex: 100,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6366f122' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            ⚙
          </div>
        </Popover>
      )}

      {/* 병합 모드 토글 */}
      {item.type === 'TableContainer' && (
        <Tooltip title={mergeMode ? '병합 모드 OFF' : '병합 모드 ON'} placement="bottom">
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMergeModeChange(!mergeMode) }}
            style={{
              position: 'absolute', top: 0, left: 26,
              width: 26, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 11, zIndex: 100,
              color: mergeMode ? '#fff' : '#555',
              background: mergeMode ? '#6366f1' : 'transparent',
            }}
            onMouseEnter={e => { if (!mergeMode) e.currentTarget.style.background = '#6366f122' }}
            onMouseLeave={e => { if (!mergeMode) e.currentTarget.style.background = 'transparent' }}
          >
            ⊞
          </div>
        </Tooltip>
      )}

      {/* 삭제 버튼 */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        style={{
          position: 'absolute', top: 0, right: 0,
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 11, color: '#555', zIndex: 100,
          borderRadius: '0 6px 0 6px',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ff4d4f'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555' }}
      >
        ✕
      </div>

      {/* Container */}
      {item.type === 'Container' && (
        <div ref={containerRef} style={{ width: '100%', flex: 1 }}>
          <NestedCanvas
            containerId={item.id}
            children={item.children || []}
            onChildrenChange={onChildrenChange}
            containerWidth={innerWidth || 100}
          />
        </div>
      )}

      {/* TableContainer */}
      {item.type === 'TableContainer' && (
        <div style={{ width: '100%', flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              {(item.props.columns || []).map((_, i) => (
                <col key={i} style={{ width: `${100 / (item.props.columns?.length || 1)}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {(item.props.columns || []).map((col, i) => (
                  <th key={i} style={{
                    padding: '6px 10px', background: '#1e1e2e',
                    borderBottom: '1px solid #333',
                    borderRight: i < (item.props.columns?.length - 1) ? '1px solid #2a2a2a' : 'none',
                    color: '#888', fontWeight: 500, textAlign: 'left', fontSize: 11,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          <TableBody
            item={item}
            onChildrenChange={onChildrenChange}
            onMergesChange={onMergesChange}
            mergeMode={mergeMode}
          />
        </div>
      )}

      {!isContainer && (
        <div style={{ width: '100%', pointerEvents: 'none' }}>
          {renderComponent(item.type, item.props)}
        </div>
      )}
    </div>
  )
}