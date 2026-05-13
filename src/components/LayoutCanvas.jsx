import React, { useRef, useEffect, useState } from 'react'
import { Select } from 'antd'
import NestedCanvas from './NestedCanvas'
import { find, getSpan, cellKey } from '../utils/mergeUtils'
import { getEffectiveMerges, getCellTitle, getCellHeight } from '../utils/layoutStore'

function CardCell({ cellKey: key, col, rowSpan, colSpan, title, height, templateId, colChildren, onChildrenChange, colWidth }) {
  return (
    <td
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={{
        verticalAlign: 'top',
        padding: 0,
        height,
        border: '1px solid #222',
      }}
    >
      <div style={{
        background: '#161616',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Card 헤더 */}
        <div style={{
          padding: '7px 12px',
          borderBottom: '1px solid #222',
          fontSize: 12, fontWeight: 500, color: '#888',
          background: '#141414', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {title}
          {(rowSpan > 1 || colSpan > 1) && (
            <span style={{ fontSize: 9, color: '#444' }}>{rowSpan}×{colSpan}</span>
          )}
        </div>

        {/* 드롭 영역 */}
        <div style={{ flex: 1 }}>
          <NestedCanvas
            containerId={`layout-${templateId}-${key}`}
            children={colChildren || []}
            onChildrenChange={onChildrenChange}
            containerWidth={colWidth * colSpan - 8}
          />
        </div>
      </div>
    </td>
  )
}

export default function LayoutCanvas({ templates, selectedId, onSelect, layoutChildren, onLayoutChildrenChange }) {
  const tableRef = useRef(null)
  const [tableWidth, setTableWidth] = useState(0)

  useEffect(() => {
    if (!tableRef.current) return
    const o = new ResizeObserver(entries => {
      for (const entry of entries) setTableWidth(entry.contentRect.width)
    })
    o.observe(tableRef.current)
    return () => o.disconnect()
  }, [])

  const selectedTemplate = templates.find(t => t.id === selectedId)

  if (templates.length === 0) return null

  const colWidth = tableWidth ? tableWidth / (selectedTemplate?.cols || 1) : 100

  return (
    <div style={{
      borderBottom: '1px solid #222',
      background: '#0d0d0d',
      flexShrink: 0,
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid #1e1e1e',
      }}>
        <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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
          <span style={{ fontSize: 10, color: '#444' }}>
            {selectedTemplate.rows}행 × {selectedTemplate.cols}열
          </span>
        )}
      </div>

      {/* 레이아웃 테이블 */}
      {selectedTemplate && (
        <div style={{ padding: '8px 12px' }} ref={tableRef}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              {(() => {
                const widths = Array.from({ length: selectedTemplate.cols }, (_, i) =>
                  selectedTemplate.colWidths?.[i] ?? (100 / selectedTemplate.cols)
                )
                const total = widths.reduce((s, w) => s + w, 0)
                return widths.map((w, i) => (
                  <col key={i} style={{ width: `${(w / total) * 100}%` }} />
                ))
              })()}
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
                          colWidth={colWidth}
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