import { cellKey, find, union, split, getSpan, initMerges, canMergeAll } from './mergeUtils'

export function createTemplate(name = '새 레이아웃') {
  return {
    id: `tpl-${Date.now()}`,
    name,
    rows: 3,
    cols: 2,
    merges: {},
    cellTitles: {},
    cellHeights: {},
    colWidths: {}, // 각 열의 비율 (기본 균등)
  }
}

export function getColWidth(template, colIdx) {
  return template.colWidths?.[colIdx] ?? (100 / template.cols)
}

export function updateColWidth(template, colIdx, width) {
  return {
    ...template,
    colWidths: { ...template.colWidths, [colIdx]: width }
  }
}

export function getEffectiveMerges(template) {
  const { rows, cols, merges } = template
  if (merges && Object.keys(merges).length > 0) return merges
  return initMerges(rows, cols)
}

export function getCellTitle(template, key) {
  return template.cellTitles?.[key] || key
}

export function updateCellTitle(template, key, title) {
  return { ...template, cellTitles: { ...template.cellTitles, [key]: title } }
}

export function updateCellHeight(template, rowIdx, height) {
  return {
    ...template,
    cellHeights: { ...template.cellHeights, [rowIdx]: Math.max(60, height) }
  }
}

export function getCellHeight(template, rowIdx) {
  return template.cellHeights?.[rowIdx] || 100
}

export function mergeCells(template, selectedKeys) {
  const merges = getEffectiveMerges(template)
  let next = { ...merges }
  const roots = [...new Set(selectedKeys.map(k => find(next, k)))]
  for (let i = 1; i < roots.length; i++) {
    next = union(next, roots[0], roots[i])
  }
  return { ...template, merges: next }
}

export function splitCells(template, selectedKeys) {
  const merges = getEffectiveMerges(template)
  let next = { ...merges }
  selectedKeys.forEach(key => { next = split(next, key) })
  return { ...template, merges: next }
}