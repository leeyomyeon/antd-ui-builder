import React from 'react'
import GridLayout from 'react-grid-layout'
import CanvasItem from './CanvasItem'
import LayoutCanvas from './LayoutCanvas'

const COLS = 12
const ROW_HEIGHT = 40
const CANVAS_WIDTH = 800

export default function Canvas({ items, setItems, templates, selectedLayoutId, onSelectLayout, layoutChildren, onLayoutChildrenChange }) {

  const handleDrop = (e) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('componentType')
    if (!raw) return

    const componentDef = JSON.parse(raw)
    const canvasRect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - canvasRect.left
    const y = e.clientY - canvasRect.top
    const gridX = Math.min(Math.floor((x / CANVAS_WIDTH) * COLS), COLS - componentDef.defaultW)
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
        h: componentDef.defaultH,
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
    ...item.layout,
    i: item.id,
    isDraggable: item.mergeMode ? false : undefined,
    isResizable: item.mergeMode ? false : undefined,
  }))

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'auto',
      background: '#0f0f0f',
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
        style={{ flex: 1, position: 'relative', minHeight: 400 }}
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
            <div style={{ color: '#333', fontSize: 13 }}>왼쪽 팔레트에서 컴포넌트를 드래그하세요</div>
          </div>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none', opacity: 0.6,
        }} />

        <div style={{ padding: 16, minHeight: '100%' }}>
          <GridLayout
            className="layout"
            layout={layout}
            cols={COLS}
            rowHeight={ROW_HEIGHT}
            width={CANVAS_WIDTH}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            margin={[8, 8]}
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