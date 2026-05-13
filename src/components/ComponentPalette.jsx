import React, { useState } from 'react'
import { message } from 'antd'
import { COMPONENT_PALETTE } from '../utils/componentConfig'
import { OVERLAY_COMPONENTS } from '../utils/overlayConfig'

export default function ComponentPalette({ onAddOverlay, overlays }) {
  const [openCategories, setOpenCategories] = useState(
    COMPONENT_PALETTE.map(c => c.category)
  )
  const [overlayOpen, setOverlayOpen] = useState(true)

  const toggleCategory = (cat) => {
    setOpenCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('componentType', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleOverlayClick = (def) => {
    const alreadyAdded = overlays.some(o => o.type === def.type)
    if (alreadyAdded) {
      message.warning(`${def.label}은 이미 추가됨`)
      return
    }
    onAddOverlay(def)
    message.success(`${def.label} 추가됨`)
  }

  return (
    <div style={{
      width: 200,
      background: '#141414',
      borderRight: '1px solid #222',
      overflow: 'auto',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #222',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: '#666',
        textTransform: 'uppercase',
      }}>
        Components
      </div>

      {/* 오버레이 카테고리 */}
      <div>
        <div
          onClick={() => setOverlayOpen(v => !v)}
          style={{
            padding: '8px 14px',
            fontSize: 11, fontWeight: 600, color: '#6366f1',
            cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            userSelect: 'none', letterSpacing: '0.06em', textTransform: 'uppercase',
            background: '#141414',
          }}
        >
          Overlay
          <span style={{ fontSize: 9 }}>{overlayOpen ? '▲' : '▼'}</span>
        </div>

        {overlayOpen && (
          <div style={{ paddingBottom: 4 }}>
            {OVERLAY_COMPONENTS.map(def => {
              const added = overlays.some(o => o.type === def.type)
              return (
                <div
                  key={def.type}
                  onClick={() => handleOverlayClick(def)}
                  style={{
                    margin: '2px 8px',
                    padding: '7px 10px',
                    background: added ? '#1a1a2e' : '#1a1a1a',
                    border: `1px solid ${added ? '#6366f144' : '#2a2a2a'}`,
                    borderRadius: 5,
                    fontSize: 12,
                    color: added ? '#6366f1' : '#aaa',
                    cursor: added ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                  onMouseEnter={e => {
                    if (added) return
                    e.currentTarget.style.background = '#1f1f1f'
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = '#c4c4ff'
                  }}
                  onMouseLeave={e => {
                    if (added) return
                    e.currentTarget.style.background = '#1a1a1a'
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.color = '#aaa'
                  }}
                >
                  <span style={{ fontSize: 10, color: added ? '#6366f1' : '#6366f1' }}>
                    {added ? '✓' : '⊕'}
                  </span>
                  {def.label}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: '#222', margin: '4px 0' }} />

      {/* 일반 컴포넌트 카테고리 */}
      {COMPONENT_PALETTE.map(group => (
        <div key={group.category}>
          <div
            onClick={() => toggleCategory(group.category)}
            style={{
              padding: '8px 14px',
              fontSize: 11, fontWeight: 600, color: '#555',
              cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              userSelect: 'none', letterSpacing: '0.06em', textTransform: 'uppercase',
              background: '#141414',
            }}
          >
            {group.category}
            <span style={{ fontSize: 9 }}>
              {openCategories.includes(group.category) ? '▲' : '▼'}
            </span>
          </div>

          {openCategories.includes(group.category) && (
            <div style={{ paddingBottom: 4 }}>
              {group.items.map(item => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  style={{
                    margin: '2px 8px',
                    padding: '7px 10px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 5,
                    fontSize: 12, color: '#aaa',
                    cursor: 'grab',
                    userSelect: 'none',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1f1f1f'
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = '#c4c4ff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#1a1a1a'
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.color = '#aaa'
                  }}
                >
                  <span style={{ fontSize: 10, color: '#6366f1' }}>⠿</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}