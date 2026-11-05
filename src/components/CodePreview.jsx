import React, { useState, useEffect, useRef } from 'react'
import { App, Switch } from 'antd'
import { generateCode } from '../utils/codeGenerator'
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'

export default function CodePreview({ items, overlays = [], onToggleOverlay, onRemoveOverlay, selectedTemplate = null, layoutChildren = {}, width = 320 }) {
  const { message } = App.useApp()
  const [tab, setTab] = useState('canvas')
  const [copied, setCopied] = useState(false)
  const codeRef = useRef(null)
  const code = generateCode(items, overlays, selectedTemplate, layoutChildren)

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current)
  }, [code, tab])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    message.success('코드 복사됨!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      width,
      minWidth: 200,
      maxWidth: 600,
      background: 'var(--code-bg)',
      borderLeft: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* 탭 헤더 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--line)',
        background: 'var(--code-head)',
        flexShrink: 0,
      }}>
        {['canvas', 'overlay'].map(t => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 0',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: tab === t ? '#6366f1' : 'var(--text-faint)',
              borderBottom: `2px solid ${tab === t ? '#6366f1' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            {t === 'canvas' ? 'Code' : `Overlay ${overlays.length > 0 ? `(${overlays.length})` : ''}`}
          </div>
        ))}
      </div>

      {/* Code 탭 */}
      {tab === 'canvas' && (
        <>
          <div style={{
            padding: '8px 14px',
            borderBottom: '1px solid var(--line-faint)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#166534' : 'var(--bg-control)',
                border: `1px solid ${copied ? '#16a34a' : 'var(--line-heavy)'}`,
                borderRadius: 4,
                color: copied ? '#4ade80' : 'var(--text-muted)',
                fontSize: 11,
                padding: '3px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <pre style={{ margin: 0, padding: '14px', background: 'transparent', fontSize: 11, lineHeight: 1.7 }}>
              <code ref={codeRef} className="language-jsx">{code}</code>
            </pre>
          </div>

          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--bg-control)',
            fontSize: 10, color: 'var(--text-faint)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{items.length}개 컴포넌트</span>
            <span>{code.split('\n').length} lines</span>
          </div>
        </>
      )}

      {/* Overlay 탭 */}
      {tab === 'overlay' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {overlays.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 10,
              color: 'var(--text-placeholder)', fontSize: 12,
            }}>
              <div style={{ fontSize: 28, opacity: 0.2 }}>⧉</div>
              왼쪽 팔레트에서 Overlay를 추가하세요
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {overlays.map(overlay => (
                <div
                  key={overlay.id}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--line-faint)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* 이름 + 토글 + 삭제 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch
                      size="small"
                      checked={overlay.visible}
                      onChange={(val) => onToggleOverlay(overlay.id, val)}
                    />
                    <span style={{
                      fontSize: 12, flex: 1,
                      color: overlay.visible ? 'var(--text-accent)' : 'var(--text-dim)',
                    }}>
                      {overlay.label}
                    </span>
                    <div
                      onClick={() => onRemoveOverlay(overlay.id)}
                      style={{
                        fontSize: 10, color: 'var(--text-faint)', cursor: 'pointer',
                        padding: '2px 5px', borderRadius: 3,
                        border: '1px solid var(--line-strong)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#ff4d4f'
                        e.currentTarget.style.borderColor = '#ff4d4f'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-faint)'
                        e.currentTarget.style.borderColor = 'var(--line-strong)'
                      }}
                    >
                      ✕
                    </div>
                  </div>

                  {/* 타입 뱃지 */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      fontSize: 9, padding: '2px 6px',
                      background: 'var(--bg-accent-soft)', color: '#6366f1',
                      borderRadius: 3, border: '1px solid #6366f133',
                    }}>
                      {overlay.position}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px',
                      background: overlay.visible ? 'var(--bg-success-soft)' : 'var(--bg-control)',
                      color: overlay.visible ? '#4ade80' : 'var(--text-subtle)',
                      borderRadius: 3,
                    }}>
                      {overlay.visible ? 'visible' : 'hidden'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}