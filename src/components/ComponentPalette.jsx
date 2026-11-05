import React, { useState } from 'react'
import { App } from 'antd'
import { COMPONENT_PALETTE } from '../utils/componentConfig'
import { OVERLAY_COMPONENTS } from '../utils/overlayConfig'

export default function ComponentPalette({ onAddOverlay, overlays }) {
  const { message } = App.useApp()
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
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--line)',
      overflow: 'auto',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--line)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: 'var(--text-dim)',
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
            background: 'var(--bg-panel)',
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
                    background: added ? 'var(--bg-accent-soft)' : 'var(--bg-control)',
                    border: `1px solid ${added ? '#6366f144' : 'var(--line-strong)'}`,
                    borderRadius: 5,
                    fontSize: 12,
                    color: added ? '#6366f1' : 'var(--text-secondary)',
                    cursor: added ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                  onMouseEnter={e => {
                    if (added) return
                    e.currentTarget.style.background = 'var(--bg-elevated)'
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = 'var(--text-accent)'
                  }}
                  onMouseLeave={e => {
                    if (added) return
                    e.currentTarget.style.background = 'var(--bg-control)'
                    e.currentTarget.style.borderColor = 'var(--line-strong)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
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
      <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />

      {/* 일반 컴포넌트 카테고리 */}
      {COMPONENT_PALETTE.map(group => (
        <div key={group.category}>
          <div
            onClick={() => toggleCategory(group.category)}
            style={{
              padding: '8px 14px',
              fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)',
              cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              userSelect: 'none', letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'var(--bg-panel)',
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
                    background: 'var(--bg-control)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 5,
                    fontSize: 12, color: 'var(--text-secondary)',
                    cursor: 'grab',
                    userSelect: 'none',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-elevated)'
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = 'var(--text-accent)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-control)'
                    e.currentTarget.style.borderColor = 'var(--line-strong)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
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