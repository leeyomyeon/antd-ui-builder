import React from 'react'
import renderComponent from './renderComponent'

export default function NestedCanvasItem({ item, onRemove }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg-nested)',
      border: '1px solid var(--line-heavy)',
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 8px 6px',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: 6,
        fontSize: 9, color: 'var(--text-faint)', pointerEvents: 'none', userSelect: 'none',
      }}>
        {item.type}
      </div>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        style={{
          position: 'absolute', top: 0, right: 0,
          width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 10, color: 'var(--text-subtle)', zIndex: 100,
          borderRadius: '0 4px 0 4px',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ff4d4f'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}
      >
        ✕
      </div>
      <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        {renderComponent(item.type, item.props)}
      </div>
    </div>
  )
}