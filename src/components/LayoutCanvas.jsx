import React, { useRef, useLayoutEffect, useState } from 'react'
import { Select } from 'antd'
import NestedCanvas from './NestedCanvas'
import { find, getSpan, cellKey } from '../utils/mergeUtils'
import { getEffectiveMerges, getCellTitle, getCellHeight } from '../utils/layoutStore'

function CardCell({ cellKey: key, rowSpan, colSpan, title, height, templateId, colChildren, onChildrenChange, cellWidth }) {
  return (
    <td
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={{
        verticalAlign: 'top',
        padding: 0,
        height,
        border: '1px solid var(--line)',
      }}
    >
      <div style={{
        background: 'var(--bg-item)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Card 헤더 */}
        <div style={{
          padding: '7px 12px',
          borderBottom: '1px solid var(--line)',
          fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
          background: 'var(--bg-panel)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {title}
          {(rowSpan > 1 || colSpan > 1) && (
            <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>{rowSpan}×{colSpan}</span>
          )}
        </div>

        {/* 드롭 영역 */}
        <div style={{ flex: 1 }}>
          <NestedCanvas
            containerId={`layout-${templateId}-${key}`}
            children={colChildren || []}
            onChildrenChange={onChildrenChange}
            containerWidth={cellWidth - 8}
          />
        </div>
      </div>
    </td>
  )
}

export default function LayoutCanvas({ templates, selectedId, onSelect, layoutChildren, onLayoutChildrenChange }) {
  const tableRef = useRef(null)
  const [tableWidth, setTableWidth] = useState(0)

  const selectedTemplate = templates.find(t => t.id === selectedId)
  const hasTable = !!selectedTemplate

  // 템플릿이 나중에 선택/로드되면 그때 테이블이 마운트되므로 hasTable로 다시 연결
  useLayoutEffect(() => {
    if (!tableRef.current) return
    setTableWidth(tableRef.current.offsetWidth)
    const o = new ResizeObserver(entries => {
      for (const entry of entries) setTableWidth(entry.contentRect.width)
    })
    o.observe(tableRef.current)
    return () => o.disconnect()
  }, [hasTable])

  if (templates.length === 0) return null

  const colRatios = selectedTemplate
    ? (() => {
        const widths = Array.from({ length: selectedTemplate.cols }, (_, i) =>
          selectedTemplate.colWidths?.[i] ?? (100 / selectedTemplate.cols)
        )
        const total = widths.reduce((s, w) => s + w, 0)
        return widths.map(w => w / total)
      })()
    : []

  return (
    <div style={{
      borderBottom: '1px solid var(--line)',
      background: 'var(--bg-sunken)',
      flexShrink: 0,
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--line-faint)',
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Layout
        </span>
        <Select
          size="small"
          value={selectedId}
          onChange={onSelect}
          style={{ width: 180, fontSize: 11 }}
          options={templates.map(t => ({ value: t.id, label: t.name }))}
        />
        {selectedTemplate && (
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
            {selectedTemplate.rows}행 × {selectedTemplate.cols}열
          </span>
        )}
      </div>

      {/* 레이아웃 테이블 */}
      {selectedTemplate && (
        <div style={{ padding: '8px 12px' }}>
          <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              {colRatios.map((r, i) => (
                <col key={i} style={{ width: `${r * 100}%` }} />
              ))}
            </colgroup>
            <tbody>
              {(() => {
                const merges = getEffectiveMerges(selectedTemplate)
                const renderedCells = new Set()
                return Array.from({ length: selectedTemplate.rows }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {Array.from({ length: selectedTemplate.cols }).map((_, colIdx) => {
                      const key = cellKey(rowIdx, colIdx)
                      const root = find(merges, key)
                      if (root !== key || renderedCells.has(key)) {
                        renderedCells.add(key)
                        return null
                      }
                      renderedCells.add(key)

                      const { rowSpan, colSpan } = getSpan(merges, root)
                      const title = getCellTitle(selectedTemplate, key)
                      const height = getCellHeight(selectedTemplate, rowIdx)
                      const spanRatio = colRatios.slice(colIdx, colIdx + colSpan).reduce((s, r) => s + r, 0)

                      return (
                        <CardCell
                          key={key}
                          cellKey={key}
                          rowSpan={rowSpan}
                          colSpan={colSpan}
                          title={title}
                          height={height}
                          templateId={selectedTemplate.id}
                          colChildren={layoutChildren[`${selectedTemplate.id}-${key}`] || []}
                          onChildrenChange={(children) =>
                            onLayoutChildrenChange(`${selectedTemplate.id}-${key}`, children)
                          }
                          cellWidth={tableWidth ? tableWidth * spanRatio : 100}
                        />
                      )
                    })}
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}