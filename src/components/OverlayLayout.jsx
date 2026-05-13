import React from 'react'

export default function OverlayLayer({ overlays, onToggle }) {
  const visible = overlays.filter(o => o.visible)
  const topAlerts = visible.filter(o => o.position === 'top')
  const fullscreenSpin = visible.find(o => o.position === 'fullscreen')
  const modals = visible.filter(o => o.position === 'center')
  const drawers = visible.filter(o => o.position === 'drawer')

  const colorMap = {
    info:    { bg: '#111d2c', border: '#15395b', icon: 'ℹ', color: '#4096ff' },
    success: { bg: '#0d2a1a', border: '#1a4a2e', icon: '✓', color: '#52c41a' },
    warning: { bg: '#2a1f0a', border: '#4a3510', icon: '⚠', color: '#faad14' },
    error:   { bg: '#2a0f0f', border: '#4a1a1a', icon: '✕', color: '#ff4d4f' },
  }

  return (
    <>
      {/* Alert - 상단 고정 */}
      {topAlerts.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          zIndex: 50,
        }}>
          {topAlerts.map(overlay => {
            const type = overlay.props.type || 'info'
            const c = colorMap[type]
            return (
              <div key={overlay.id} style={{
                background: c.bg,
                borderBottom: `1px solid ${c.border}`,
                padding: '8px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
                width: '100%', boxSizing: 'border-box',
              }}>
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
                  style={{ color: '#555', cursor: 'pointer', fontSize: 12, lineHeight: '20px', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                >✕</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Spin - 전체 덮기 */}
      {fullscreenSpin && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid #333',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'overlaySpinAnim 0.8s linear infinite',
          }} />
          {fullscreenSpin.props.tip && (
            <div style={{ color: '#aaa', fontSize: 13, marginTop: 12 }}>
              {fullscreenSpin.props.tip}
            </div>
          )}
          <style>{`@keyframes overlaySpinAnim { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Modal - 중앙 팝업 */}
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
            {/* 헤더 */}
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
            {/* 바디 */}
            <div style={{ padding: '16px', color: '#aaa', fontSize: 13, flex: 1, overflow: 'auto' }}>
              {overlay.props.children}
            </div>
            {/* 푸터 */}
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
      {drawers.map(overlay => {
        const placement = overlay.props.placement || 'right'
        const isVertical = placement === 'left' || placement === 'right'

        const posStyle = {
          right:  { top: 0, right: 0, bottom: 0, width: '60%', maxWidth: 320, height: '100%' },
          left:   { top: 0, left: 0, bottom: 0, width: '60%', maxWidth: 320, height: '100%' },
          bottom: { left: 0, right: 0, bottom: 0, height: overlay.props.height || 300 },
          top:    { left: 0, right: 0, top: 0, height: overlay.props.height || 300 },
        }[placement]

        return (
          <div
            key={overlay.id}
            onClick={(e) => { if (e.target === e.currentTarget) onToggle(overlay.id, false) }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 50,
            }}
          >
            <div style={{
              position: 'absolute',
              ...posStyle,
              background: '#1f1f1f',
              borderLeft: placement === 'right' ? '1px solid #333' : 'none',
              borderRight: placement === 'left' ? '1px solid #333' : 'none',
              borderTop: placement === 'bottom' ? '1px solid #333' : 'none',
              borderBottom: placement === 'top' ? '1px solid #333' : 'none',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* 헤더 */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>
                  {overlay.props.title}
                </span>
                <span
                  onClick={() => onToggle(overlay.id, false)}
                  style={{ color: '#555', cursor: 'pointer', fontSize: 16 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                >✕</span>
              </div>
              {/* 바디 */}
              <div style={{ padding: '16px', color: '#aaa', fontSize: 13, flex: 1, overflow: 'auto' }}>
                {overlay.props.children}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}