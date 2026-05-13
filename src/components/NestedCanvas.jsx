import React from 'react'
import GridLayout from 'react-grid-layout'
import NestedCanvasItem from './NestedCanvasItem'

const COLS = 12
const ROW_HEIGHT = 36

export default function NestedCanvas({ containerId, children = [], onChildrenChange, containerWidth = 600 }) {

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
    const gridX = Math.min(Math.floor((x / containerWidth) * COLS), COLS - componentDef.defaultW)
    const gridY = Math.floor(y / ROW_HEIGHT)

    const id = `${componentDef.type}-${Date.now()}`
    const newItem = {
      id,
      type: componentDef.type,
      props: { ...componentDef.props },
      layout: { i: id, x: Math.max(0, gridX), y: Math.max(0, gridY), w: componentDef.defaultW, h: componentDef.defaultH },
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

  const layout = children.map(c => ({ ...c.layout, i: c.id }))

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
      // 내부 GridLayout 드래그가 부모로 전파되지 않도록 차단
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        minHeight: 80,
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
          fontSize: 11, color: '#333', pointerEvents: 'none',
        }}>
          여기에 컴포넌트를 드롭하세요
        </div>
      )}
      <GridLayout
        layout={layout}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[6, 6]}
        containerPadding={[4, 4]}
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