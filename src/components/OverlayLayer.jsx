import React from 'react'
import { Alert, Spin, Modal, Drawer } from 'antd'

export default function OverlayLayer({ overlays, onToggle }) {
  const visible = overlays.filter(o => o.visible)

  // 상단 Alert들
  const topAlerts = visible.filter(o => o.position === 'top')
  const fullscreenSpin = visible.find(o => o.position === 'fullscreen')
  const modals = visible.filter(o => o.position === 'center')
  const drawers = visible.filter(o => o.position === 'drawer')

  return (
    <>
      {/* 상단 Alert - antd Alert 대신 직접 구현 */}
      {topAlerts.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {topAlerts.map(overlay => {
            const colorMap = {
              info:    { bg: '#111d2c', border: '#15395b', icon: 'ℹ', color: '#4096ff' },
              success: { bg: '#0d2a1a', border: '#1a4a2e', icon: '✓', color: '#52c41a' },
              warning: { bg: '#2a1f0a', border: '#4a3510', icon: '⚠', color: '#faad14' },
              error:   { bg: '#2a0f0f', border: '#4a1a1a', icon: '✕', color: '#ff4d4f' },
            }
            const type = overlay.props.type || 'info'
            const c = colorMap[type]

            return (
              <div
                key={overlay.id}
                style={{
                  background: c.bg,
                  borderBottom: `1px solid ${c.border}`,
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ color: c.color, fontSize: 14, lineHeight: '20px', flexShrink: 0 }}>
                  {c.icon}
                </span>
                <div style={{ flex: 1 }}>
                  {overlay.props.message && (
                    <div style={{ color: c.color, fontSize: 13, fontWeight: 500 }}>
                      {overlay.props.message}
                    </div>
                  )}
                  {overlay.props.description && (
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                      {overlay.props.description}
                    </div>
                  )}
                </div>
                <span
                  onClick={() => onToggle(overlay.id, false)}
                  style={{
                    color: '#555', cursor: 'pointer', fontSize: 12,
                    lineHeight: '20px', flexShrink: 0, padding: '0 2px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                >
                  ✕
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* 전체화면 Spin */}
      {fullscreenSpin && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          pointerEvents: 'auto',
          // 부모 영역 밖으로 못 나가도록
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}>
          <Spin size="large" tip={fullscreenSpin.props.tip} />
        </div>
      )}

      {/* Modal */}
      {modals.map(overlay => (
        <div
          key={overlay.id}
          onClick={(e) => { if (e.target === e.currentTarget) onToggle(overlay.id, false) }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50,
            clipPath: 'inset(0)',
          }}
        >
          <div style={{
            background: '#1f1f1f',
            border: '1px solid #333',
            borderRadius: 8,
            width: '80%', maxWidth: 480,
            maxHeight: '80%',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid #333',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>
                {overlay.props.title}
              </span>
              <span
                onClick={() => onToggle(overlay.id, false)}
                style={{ color: '#555', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
              >✕</span>
            </div>
            <div style={{ padding: '16px', color: '#aaa', fontSize: 13, flex: 1, overflow: 'auto' }}>
              {overlay.props.children}
            </div>
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid #333',
              display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}>
              <button
                onClick={() => onToggle(overlay.id, false)}
                style={{
                  padding: '5px 14px', fontSize: 12, borderRadius: 4,
                  background: 'transparent', border: '1px solid #444',
                  color: '#aaa', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#666' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#444' }}
              >취소</button>
              <button
                onClick={() => onToggle(overlay.id, false)}
                style={{
                  padding: '5px 14px', fontSize: 12, borderRadius: 4,
                  background: '#6366f1', border: 'none',
                  color: '#fff', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
              >확인</button>
            </div>
          </div>
        </div>
      ))}

      {/* Drawer */}
      {drawers.map(overlay => (
        <Drawer
          key={overlay.id}
          open={true}
          title={overlay.props.title}
          placement={overlay.props.placement}
          height={overlay.props.height}
          onClose={() => onToggle(overlay.id, false)}
          getContainer={false}
        >
          {overlay.props.children}
        </Drawer>
      ))}
    </>
  )
}