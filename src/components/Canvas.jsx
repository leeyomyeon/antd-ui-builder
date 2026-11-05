import React, { useLayoutEffect, useRef, useState } from 'react'
import GridLayout from 'react-grid-layout'
import CanvasItem from './CanvasItem'
import LayoutCanvas from './LayoutCanvas'
import { applySizeRule, clampDefaultH, getResizeHandles, MAIN_GRID } from '../utils/sizeRules'

const COLS = 12
const ROW_HEIGHT = MAIN_GRID.rowHeight
const CANVAS_PADDING = 16
const MIN_GRID_WIDTH = 600
const RESIZE_HANDLES = ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']

export default function Canvas({ items, setItems, templates, selectedLayoutId, onSelectLayout, layoutChildren, onLayoutChildrenChange }) {
  const scrollerRef = useRef(null)
  const [availableWidth, setAvailableWidth] = useState(0)

  useLayoutEffect(() => {
    setAvailableWidth(scrollerRef.current.clientWidth)
    const o = new ResizeObserver(entries => {
      for (const entry of entries) setAvailableWidth(entry.contentRect.width)
    })
    o.observe(scrollerRef.current)
    return () => o.disconnect()
  }, [])

  const gridWidth = Math.max(MIN_GRID_WIDTH, availableWidth - CANVAS_PADDING * 2)

  const handleDrop = (e) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('componentType')
    if (!raw) return

    const componentDef = JSON.parse(raw)
    const canvasRect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - canvasRect.left - CANVAS_PADDING
    const y = e.clientY - canvasRect.top - CANVAS_PADDING
    const gridX = Math.min(Math.floor((x / gridWidth) * COLS), COLS - componentDef.defaultW)
    const gridY = Math.floor(y / ROW_HEIGHT)

    const id = `${componentDef.type}-${Date.now()}`
    const newItem = {
      id,
      type: componentDef.type,
      props: { ...componentDef.props },
      children: [],
      cellChildren: {},
      merges: {},
      mergeMode: false,
      layout: {
        i: id,
        x: Math.max(0, gridX),
        y: Math.max(0, gridY),
        w: componentDef.defaultW,
        h: clampDefaultH(componentDef.type, componentDef.defaultH),
      }
    }
    setItems(prev => [...prev, newItem])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleLayoutChange = (layout) => {
    setItems(prev => prev.map(item => {
      const l = layout.find(l => l.i === item.id)
      return l ? { ...item, layout: l } : item
    }))
  }

  const handleRemove = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const handleChildrenChange = (containerId, children, cellKey) => {
    setItems(prev => prev.map(item => {
      if (item.id !== containerId) return item
      if (cellKey) return { ...item, cellChildren: { ...item.cellChildren, [cellKey]: children } }
      return { ...item, children }
    }))
  }

  const handlePropsChange = (containerId, newProps) => {
    setItems(prev => prev.map(item =>
      item.id === containerId ? { ...item, props: newProps, merges: {} } : item
    ))
  }

  const handleMergesChange = (containerId, merges) => {
    setItems(prev => prev.map(item =>
      item.id === containerId ? { ...item, merges } : item
    ))
  }

  const handleMergeModeChange = (containerId, mergeMode) => {
    setItems(prev => prev.map(item =>
      item.id === containerId ? { ...item, mergeMode } : item
    ))
  }

  const layout = items.map(item => ({
    ...applySizeRule(item.layout, item.type),
    i: item.id,
    // 높이 고정 타입은 가로 핸들만 표시
    resizeHandles: getResizeHandles(item.type, RESIZE_HANDLES),
    isDraggable: item.mergeMode ? false : undefined,
    isResizable: item.mergeMode ? false : undefined,
  }))

  return (
    <div ref={scrollerRef} style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'auto',
      background: 'var(--bg-canvas)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 레이아웃 영역 */}
      <LayoutCanvas
        templates={templates}
        selectedId={selectedLayoutId}
        onSelect={onSelectLayout}
        layoutChildren={layoutChildren}
        onLayoutChildrenChange={onLayoutChildrenChange}
      />

      {/* 일반 컴포넌트 캔버스 */}
      <div
        style={{ flex: '1 0 auto', position: 'relative', minHeight: 400, minWidth: gridWidth + CANVAS_PADDING * 2 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {items.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12, pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 40, opacity: 0.15 }}>⊞</div>
            <div style={{ color: 'var(--text-placeholder)', fontSize: 13 }}>왼쪽 팔레트에서 컴포넌트를 드래그하세요</div>
          </div>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--line-strong) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none', opacity: 0.6,
        }} />

        <div style={{ padding: CANVAS_PADDING, minHeight: '100%' }}>
          <GridLayout
            className="layout"
            layout={layout}
            cols={COLS}
            rowHeight={ROW_HEIGHT}
            width={gridWidth}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            margin={[8, MAIN_GRID.marginY]}
            resizeHandles={RESIZE_HANDLES}
            containerPadding={[0, 0]}
          >
            {items.map(item => (
              <div key={item.id}>
                <CanvasItem
                  item={item}
                  onRemove={() => handleRemove(item.id)}
                  onChildrenChange={(children, cellKey) => handleChildrenChange(item.id, children, cellKey)}
                  onPropsChange={(newProps) => handlePropsChange(item.id, newProps)}
                  onMergesChange={(merges) => handleMergesChange(item.id, merges)}
                  onMergeModeChange={(mergeMode) => handleMergeModeChange(item.id, mergeMode)}
                />
              </div>
            ))}
          </GridLayout>
        </div>
      </div>
    </div>
  )
}