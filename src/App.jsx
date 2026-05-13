import React, { useState, useCallback, useRef } from 'react'
import { ConfigProvider, theme, Button, Tooltip } from 'antd'
import ComponentPalette from './components/ComponentPalette'
import Canvas from './components/Canvas'
import CodePreview from './components/CodePreview'
import OverlayLayer from './components/OverlayLayer'
import LayoutBuilder from './pages/LayoutBuilder'

export default function App() {
  const [activeTab, setActiveTab] = useState('canvas') // 'canvas' | 'layout'
  const [items, setItems] = useState([])
  const [overlays, setOverlays] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedLayoutId, setSelectedLayoutId] = useState(null)
  const [layoutChildren, setLayoutChildren] = useState({})
  const [previewWidth, setPreviewWidth] = useState(320)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleClear = () => setItems([])

  const handleMouseDown = useCallback((e) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = previewWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (e) => {
      if (!isResizing.current) return
      const delta = startX.current - e.clientX
      const newWidth = Math.min(600, Math.max(200, startWidth.current + delta))
      setPreviewWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [previewWidth])

  const handleAddOverlay = (def) => {
    const id = `${def.type}-${Date.now()}`
    setOverlays(prev => [...prev, {
      id, type: def.type, label: def.label,
      position: def.position, props: { ...def.defaultProps }, visible: false,
    }])
  }

  const handleToggleOverlay = (id, visible) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, visible } : o))
  }

  const handleRemoveOverlay = (id) => {
    setOverlays(prev => prev.filter(o => o.id !== id))
  }

  const handleSaveTemplate = (tpl) => {
    setTemplates(prev => {
      const exists = prev.findIndex(t => t.id === tpl.id)
      if (exists >= 0) {
        const next = [...prev]
        next[exists] = tpl
        return next
      }
      return [...prev, tpl]
    })
    setSelectedLayoutId(tpl.id)
  }

  const handleDeleteTemplate = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
    if (selectedLayoutId === id) setSelectedLayoutId(null)
  }

  const handleLayoutChildrenChange = (key, children) => {
    setLayoutChildren(prev => ({ ...prev, [key]: children }))
  }

  const selectedTemplate = templates.find(t => t.id === selectedLayoutId) || null

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 5,
          colorBgContainer: '#1a1a1a',
          colorBorder: '#2a2a2a',
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* 상단 툴바 */}
        <div style={{
          height: 44, background: '#111',
          borderBottom: '1px solid #1e1e1e',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 0, flexShrink: 0,
          zIndex: 10, position: 'relative',
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: '#6366f1', letterSpacing: '-0.02em', marginRight: 16,
          }}>
            ⊞ UI Builder
          </div>

          {/* 탭 */}
          {[
            { key: 'layout', label: '🏗 Layout Builder' },
            { key: 'canvas', label: '⊞ Canvas' },
          ].map(tab => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0 16px',
                height: '100%',
                display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 500,
                color: activeTab === tab.key ? '#6366f1' : '#555',
                borderBottom: `2px solid ${activeTab === tab.key ? '#6366f1' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              {tab.label}
            </div>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeTab === 'canvas' && (
              <Tooltip title="캔버스 초기화">
                <Button size="small" onClick={handleClear} disabled={items.length === 0} style={{ fontSize: 11 }}>
                  초기화
                </Button>
              </Tooltip>
            )}
            <div style={{ fontSize: 11, color: '#444' }}>antd + react-grid-layout</div>
          </div>
        </div>

        {/* 메인 영역 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Layout Builder 탭 */}
          {activeTab === 'layout' && (
            <LayoutBuilder
              templates={templates}
              selectedId={selectedLayoutId}
              onSave={handleSaveTemplate}
              onDelete={handleDeleteTemplate}
              onSelect={setSelectedLayoutId}
            />
          )}

          {/* Canvas 탭 */}
          {activeTab === 'canvas' && (
            <>
              <ComponentPalette overlays={overlays} onAddOverlay={handleAddOverlay} />

              <div style={{ flex: 1, position: 'relative', overflow: 'clip', height: '100%' }}>
                <Canvas
                  items={items}
                  setItems={setItems}
                  templates={templates}
                  selectedLayoutId={selectedLayoutId}
                  onSelectLayout={setSelectedLayoutId}
                  layoutChildren={layoutChildren}
                  onLayoutChildrenChange={handleLayoutChildrenChange}
                />
                <OverlayLayer overlays={overlays} onToggle={handleToggleOverlay} />
              </div>

              <div
                onMouseDown={handleMouseDown}
                style={{
                  width: 4, background: '#1e1e1e',
                  cursor: 'col-resize', flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6366f1' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1e1e1e' }}
              />

              <CodePreview
                items={items}
                overlays={overlays}
                onToggleOverlay={handleToggleOverlay}
                onRemoveOverlay={handleRemoveOverlay}
                selectedTemplate={selectedTemplate}
                layoutChildren={layoutChildren}
                width={previewWidth}
              />
            </>
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}