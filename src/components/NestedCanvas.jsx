import React, { useLayoutEffect, useRef, useState } from 'react'
import GridLayout from 'react-grid-layout'
import NestedCanvasItem from './NestedCanvasItem'
import { applySizeRule, clampDefaultH, getResizeHandles, NESTED_GRID } from '../utils/sizeRules'

const COLS = 12
const ROW_HEIGHT = NESTED_GRID.rowHeight
const RESIZE_HANDLES = ['se']

const PADDING = 4

// 셀에 맞춰 넣기: 가로는 셀 전체 폭, 빈 셀이면 세로도 셀 높이만큼 (타입별 최소/최대 높이 안에서)
function fitToCellLayout(componentDef, children, cellHeight) {
  const w = COLS
  if (children.length === 0) {
    const fitRows = Math.floor((cellHeight - PADDING * 2 + NESTED_GRID.marginY) / (ROW_HEIGHT + NESTED_GRID.marginY))
    return applySizeRule({ x: 0, y: 0, w, h: Math.max(1, fitRows) }, componentDef.type)
  }
  // 이미 내용이 있으면 맨 아래에 전체 폭으로 추가
  const bottom = Math.max(...children.map(c => c.layout.y + c.layout.h))
  return { x: 0, y: bottom, w, h: clampDefaultH(componentDef.type, componentDef.defaultH) }
}

export default function NestedCanvas({ containerId, children = [], onChildrenChange, containerWidth = 600, fitToCell = false }) {
  // 셀 모드에서는 실제 렌더 폭을 직접 재서 아이템이 셀 폭에 딱 맞게
  const rootRef = useRef(null)
  const [measuredWidth, setMeasuredWidth] = useState(0)
  useLayoutEffect(() => {
    if (!fitToCell || !rootRef.current) return
    setMeasuredWidth(rootRef.current.clientWidth)
    const o = new ResizeObserver(entries => {
      for (const entry of entries) setMeasuredWidth(entry.contentRect.width)
    })
    o.observe(rootRef.current)
    return () => o.disconnect()
  }, [fitToCell])
  const gridWidth = fitToCell && measuredWidth ? measuredWidth : containerWidth

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData('componentType')
    if (!raw) return

    const componentDef = JSON.parse(raw)
    if (componentDef.type === 'Container' || componentDef.type === 'TableContainer') return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const gridX = Math.min(Math.floor((x / gridWidth) * COLS), COLS - componentDef.defaultW)
    const gridY = Math.floor(y / ROW_HEIGHT)

    const id = `${componentDef.type}-${Date.now()}`
    const { minH, maxH, ...placed } = fitToCell
      // 같은 행의 다른 셀 때문에 td가 더 높을 수 있으므로 td 높이 기준
      ? fitToCellLayout(componentDef, children, e.currentTarget.closest('td')?.clientHeight ?? rect.height)
      : { x: Math.max(0, gridX), y: Math.max(0, gridY), w: componentDef.defaultW, h: clampDefaultH(componentDef.type, componentDef.defaultH) }
    const newItem = {
      id,
      type: componentDef.type,
      props: { ...componentDef.props },
      layout: { i: id, ...placed },
    }
    onChildrenChange([...children, newItem])
  }

  const handleLayoutChange = (layout) => {
    onChildrenChange(children.map(item => {
      const l = layout.find(l => l.i === item.id)
      return l ? { ...item, layout: l } : item
    }))
  }

  const handleRemove = (id) => {
    onChildrenChange(children.filter(c => c.id !== id))
  }

  const layout = children.map(c => ({
    ...applySizeRule(c.layout, c.type),
    i: c.id,
    // 높이 고정 타입은 se 대신 e(가로) 핸들만
    resizeHandles: getResizeHandles(c.type, RESIZE_HANDLES),
  }))

  return (
    <div
      ref={rootRef}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
      // 내부 GridLayout 드래그가 부모로 전파되지 않도록 차단
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        minHeight: 80,
        height: '100%',
        width: '100%',
        background: 'rgba(99,102,241,0.04)',
        borderRadius: 4,
        position: 'relative',
      }}
    >
      {children.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: 'var(--text-placeholder)', pointerEvents: 'none',
        }}>
          여기에 컴포넌트를 드롭하세요
        </div>
      )}
      <GridLayout
        layout={layout}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        width={gridWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[6, NESTED_GRID.marginY]}
        containerPadding={[PADDING, PADDING]}
      >
        {children.map(item => (
          <div key={item.id}>
            <NestedCanvasItem item={item} onRemove={() => handleRemove(item.id)} />
          </div>
        ))}
      </GridLayout>
    </div>
  )
}