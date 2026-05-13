import React, { useState, useRef } from 'react'
import { Input, Button, Tooltip, InputNumber, message } from 'antd'
import {
  createTemplate, getEffectiveMerges, getCellTitle,
  updateCellTitle, updateCellHeight, getCellHeight,
  mergeCells, splitCells, getColWidth, updateColWidth,
} from '../utils/layoutStore'
import { find, getSpan, cellKey, canMergeAll } from '../utils/mergeUtils'

function ColResizeHandle({ colIdx, tpl, setTpl, tableRef }) {
  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const tableWidth = tableRef.current?.getBoundingClientRect().width || 800
    const startWidth = getColWidth(tpl, colIdx)
    const nextWidth = getColWidth(tpl, colIdx + 1)

    const handleMouseMove = (e) => {
      const delta = ((e.clientX - startX) / tableWidth) * 100
      const newWidth = Math.max(5, startWidth + delta)
      const newNextWidth = Math.max(5, nextWidth - delta)
      if (newWidth + newNextWidth < 10) return
      setTpl(prev => ({
        ...prev,
        colWidths: {
          ...prev.colWidths,
          [colIdx]: newWidth,
          [colIdx + 1]: newNextWidth,
        }
      }))
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'col-resize'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        top: 0,
        right: -6,   // 경계선 중앙에 위치
        width: 12,
        height: '100%',
        cursor: 'col-resize',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={e => {
        const line = e.currentTarget.querySelector('.col-resize-line')
        if (line) {
          line.style.background = '#6366f1'
          line.style.width = '3px'
        }
      }}
      onMouseLeave={e => {
        const line = e.currentTarget.querySelector('.col-resize-line')
        if (line) {
          line.style.background = '#6366f133'
          line.style.width = '2px'
        }
      }}
    >
      <div className="col-resize-line" style={{
        width: 2,
        height: '70%',
        background: '#6366f133',
        borderRadius: 2,
        pointerEvents: 'none',
        transition: 'all 0.15s',
      }} />
    </div>
  )
}

function RowResizer({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        height: 6, cursor: 'row-resize',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#6366f122'
        const line = e.currentTarget.querySelector('.row-resize-line')
        if (line) line.style.opacity = '1'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        const line = e.currentTarget.querySelector('.row-resize-line')
        if (line) line.style.opacity = '0'
      }}
    >
      <div className="row-resize-line" style={{
        width: 40, height: 2, background: '#6366f1',
        borderRadius: 2, opacity: 0, transition: 'opacity 0.15s',
      }} />
    </div>
  )
}

export default function LayoutBuilder({ templates, onSave, onDelete, onSelect, selectedId }) {
  const [tpl, setTpl] = useState(createTemplate())
  const [templateName, setTemplateName] = useState('새 레이아웃')
  const [mergeMode, setMergeMode] = useState(false)
  const [selected, setSelected] = useState([])
  const dragStartHeightRef = useRef(0)
  const tableRef = useRef(null)

  const merges = getEffectiveMerges(tpl)

  const handleDimChange = (field, val) => {
    const num = Math.max(1, Math.min(field === 'rows' ? 10 : 8, val || 1))
    setTpl(prev => ({ ...prev, [field]: num, merges: {}, cellTitles: {}, cellHeights: {}, colWidths: {} }))
    setSelected([])
  }

  const handleCellClick = (key) => {
    if (!mergeMode) return
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleMerge = () => {
    if (selected.length < 2) return
    setTpl(prev => mergeCells(prev, selected))
    setSelected([])
  }

  const handleSplit = () => {
    if (selected.length === 0) return
    setTpl(prev => splitCells(prev, selected))
    setSelected([])
  }

  const handleRowResizeMouseDown = (e, rowIdx) => {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    dragStartHeightRef.current = getCellHeight(tpl, rowIdx)

    const handleMouseMove = (e) => {
      const delta = e.clientY - startY
      const newHeight = Math.max(60, dragStartHeightRef.current + delta)
      setTpl(prev => updateCellHeight(prev, rowIdx, newHeight))
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }

    document.body.style.cursor = 'row-resize'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleSave = () => {
    if (!templateName.trim()) {
      message.error('레이아웃 이름을 입력해주세요')
      return
    }
    const saved = { ...tpl, id: `tpl-${Date.now()}`, name: templateName.trim() }
    onSave(saved)
    message.success(`"${templateName}" 저장됨`)
    setTpl(createTemplate())
    setTemplateName('새 레이아웃')
    setMergeMode(false)
    setSelected([])
  }

  const handleLoadTemplate = (t) => {
    setTpl({ ...t })
    setTemplateName(t.name)
    setMergeMode(false)
    setSelected([])
  }

  const canDoMerge = canMergeAll(merges, selected)
  const canDoSplit = selected.some(key => {
    const root = find(merges, key)
    const { rowSpan, colSpan } = getSpan(merges, root)
    return rowSpan > 1 || colSpan > 1
  })

  const renderedCells = new Set()

  // 열 너비 합산이 100이 되도록 정규화
  // colWidthsNormalized 계산 부분 - 소수점 정밀도 높임
  const colWidthsNormalized = (() => {
    const widths = Array.from({ length: tpl.cols }, (_, i) => getColWidth(tpl, i))
    const total = widths.reduce((s, w) => s + w, 0)
    return widths.map(w => (w / total) * 100)
  })()

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#0f0f0f', display: 'flex' }}>

      {/* 편집 영역 */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Input
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            style={{ width: 180, fontSize: 13 }}
            placeholder="레이아웃 이름"
          />
          <Button type="primary" size="small" onClick={handleSave}>저장</Button>
        </div>

        {/* 행/열 설정 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginBottom: 16, padding: '10px 14px',
          background: '#141414', borderRadius: 6, border: '1px solid #222',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#666' }}>행</span>
            <InputNumber size="small" min={1} max={10} value={tpl.rows}
              onChange={(v) => handleDimChange('rows', v)} style={{ width: 60 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#666' }}>열</span>
            <InputNumber size="small" min={1} max={8} value={tpl.cols}
              onChange={(v) => handleDimChange('cols', v)} style={{ width: 60 }} />
          </div>

          <div style={{ width: 1, height: 20, background: '#2a2a2a' }} />

          <Tooltip title={mergeMode ? '병합 모드 OFF' : '병합 모드 ON'}>
            <div
              onClick={() => { setMergeMode(v => !v); setSelected([]) }}
              style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 4,
                cursor: 'pointer', userSelect: 'none',
                background: mergeMode ? '#6366f1' : '#1a1a1a',
                color: mergeMode ? '#fff' : '#666',
                border: `1px solid ${mergeMode ? '#6366f1' : '#333'}`,
              }}
            >
              ⊞ 병합 모드
            </div>
          </Tooltip>

          {mergeMode && (
            <>
              <span style={{ fontSize: 10, color: '#6366f1' }}>
                {selected.length === 0 ? '셀을 클릭하세요' : `${selected.length}개 선택`}
              </span>
              <button onClick={handleMerge} disabled={!canDoMerge} style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 4, border: 'none',
                cursor: canDoMerge ? 'pointer' : 'not-allowed',
                background: canDoMerge ? '#6366f1' : '#2a2a2a',
                color: canDoMerge ? '#fff' : '#555',
              }}>병합</button>
              <button onClick={handleSplit} disabled={!canDoSplit} style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 4,
                cursor: canDoSplit ? 'pointer' : 'not-allowed',
                background: 'transparent',
                color: canDoSplit ? '#aaa' : '#555',
                border: `1px solid ${canDoSplit ? '#444' : '#2a2a2a'}`,
              }}>분리</button>
              <button onClick={() => setSelected([])} style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 4,
                cursor: 'pointer', background: 'transparent',
                color: '#555', border: '1px solid #333',
              }}>초기화</button>
            </>
          )}
        </div>

        {/* 그리드 */}
        <div ref={tableRef} style={{
          background: '#141414', border: '1px solid #222',
          borderRadius: 8, overflow: 'hidden',
        }}>
          {/* Col 너비 조절 핸들 헤더 */}
          <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', position: 'relative', background: '#1a1a2e' }}>
            {Array.from({ length: tpl.cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                style={{
                  width: `${colWidthsNormalized[colIdx]}%`,  // flex → width % 로 변경
                  flexShrink: 0,
                  padding: '6px 8px',
                  fontSize: 10, color: '#6366f1',
                  textAlign: 'center',
                  position: 'relative',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  borderRight: colIdx < tpl.cols - 1 ? '1px solid #2a2a2a' : 'none',
                }}
              >
                C{colIdx + 1}
                <span style={{ color: '#6366f155', marginLeft: 4 }}>
                  {Math.round(colWidthsNormalized[colIdx])}%
                </span>

                {colIdx < tpl.cols - 1 && (
                  <div style={{ position: 'absolute', top: 0, right: -6, width: 12, height: '100%', zIndex: 20 }}>
                    <ColResizeHandle
                      colIdx={colIdx}
                      tpl={tpl}
                      setTpl={setTpl}
                      tableRef={tableRef}
                    />
                    <div style={{
                      position: 'absolute', top: '10%', left: '50%',
                      width: 3, height: '80%',
                      background: '#6366f133',
                      borderRadius: 2,
                      pointerEvents: 'none',
                      transform: 'translateX(-50%)',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 테이블 본체 */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              {colWidthsNormalized.map((w, i) => (
                <col key={i} style={{ width: `${w}%` }} />
              ))}
            </colgroup>
            <tbody>
              {Array.from({ length: tpl.rows }).map((_, rowIdx) => (
                <React.Fragment key={rowIdx}>
                  <tr>
                    {Array.from({ length: tpl.cols }).map((_, colIdx) => {
                      const key = cellKey(rowIdx, colIdx)
                      const root = find(merges, key)
                      if (root !== key || renderedCells.has(key)) {
                        renderedCells.add(key)
                        return null
                      }
                      renderedCells.add(key)

                      const { rowSpan, colSpan } = getSpan(merges, root)
                      const isSelected = selected.includes(key)
                      const isMerged = rowSpan > 1 || colSpan > 1
                      const cellHeight = getCellHeight(tpl, rowIdx)

                      return (
                        <td
                          key={colIdx}
                          rowSpan={rowSpan}
                          colSpan={colSpan}
                          onClick={() => handleCellClick(key)}
                          style={{
                            border: `1px solid ${isSelected ? '#6366f1' : '#2a2a2a'}`,
                            background: isSelected
                              ? 'rgba(99,102,241,0.12)'
                              : isMerged ? 'rgba(99,102,241,0.04)' : '#161616',
                            cursor: mergeMode ? 'cell' : 'default',
                            verticalAlign: 'top',
                            height: cellHeight,
                            position: 'relative',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}
                        >
                          {isMerged && (
                            <div style={{
                              position: 'absolute', top: 4, right: 6,
                              fontSize: 9, color: '#6366f155',
                              pointerEvents: 'none', userSelect: 'none',
                            }}>
                              {rowSpan}×{colSpan}
                            </div>
                          )}

                          {!mergeMode && (
                            <div style={{ padding: '8px 10px' }}>
                              <div style={{ fontSize: 9, color: '#444', marginBottom: 4 }}>Card 제목</div>
                              <Input
                                size="small"
                                value={getCellTitle(tpl, key)}
                                onChange={(e) => setTpl(prev => updateCellTitle(prev, key, e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontSize: 11 }}
                              />
                              <div style={{ fontSize: 9, color: '#333', marginTop: 6 }}>
                                {key} · h: {cellHeight}px
                              </div>
                            </div>
                          )}

                          {mergeMode && isSelected && (
                            <div style={{
                              position: 'absolute', top: 4, left: 6,
                              fontSize: 9, color: '#6366f1',
                            }}>✓</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Row 높이 리사이즈 핸들 */}
                  <tr>
                    <td colSpan={tpl.cols} style={{ padding: 0, border: 'none' }}>
                      <RowResizer onMouseDown={(e) => handleRowResizeMouseDown(e, rowIdx)} />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 저장된 템플릿 목록 */}
      <div style={{
        width: 220, background: '#141414',
        borderLeft: '1px solid #222',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid #222',
          fontSize: 11, fontWeight: 600, color: '#666',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          저장된 템플릿
        </div>

        {templates.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: '#333', textAlign: 'center', marginTop: 20 }}>
            저장된 레이아웃 없음
          </div>
        ) : (
          <div style={{ overflow: 'auto', flex: 1 }}>
            {templates.map(t => (
              <div
                key={t.id}
                style={{
                  padding: '10px 14px', borderBottom: '1px solid #1e1e1e',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: selectedId === t.id ? '#1a1a2e' : 'transparent',
                }}
              >
                <div onClick={() => onSelect(t.id)} style={{ flex: 1, cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, color: selectedId === t.id ? '#c4c4ff' : '#888' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                    {t.rows}행 × {t.cols}열
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Tooltip title="편집">
                    <div
                      onClick={() => handleLoadTemplate(t)}
                      style={{ fontSize: 10, color: '#555', cursor: 'pointer', padding: '2px 4px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#6366f1' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                    >✎</div>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <div
                      onClick={() => onDelete(t.id)}
                      style={{ fontSize: 10, color: '#555', cursor: 'pointer', padding: '2px 4px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4f' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                    >✕</div>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}