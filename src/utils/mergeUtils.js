export function find(merges, key) {
  if (!merges[key] || merges[key] === key) return key
  return find(merges, merges[key])
}

export function union(merges, a, b) {
  const rootA = find(merges, a)
  const rootB = find(merges, b)
  if (rootA === rootB) return merges
  const next = { ...merges }
  next[rootB] = rootA
  return next
}

export function split(merges, key) {
  const root = find(merges, key)
  const next = { ...merges }
  Object.keys(next).forEach(k => {
    if (find(merges, k) === root) next[k] = k
  })
  return next
}

export function cellKey(row, col) {
  return `r${row}c${col}`  // '-' 제거해서 파싱 단순화
}

export function parseKey(key) {
  // 'r0c0', 'r10c2' 등 파싱
  const match = key.match(/^r(\d+)c(\d+)$/)
  if (!match) return { row: 0, col: 0 }
  return { row: Number(match[1]), col: Number(match[2]) }
}

export function isRoot(merges, key) {
  return find(merges, key) === key
}

export function getAllCells(merges, root) {
  return Object.keys(merges).filter(k => find(merges, k) === root)
}

export function formsRectangle(keys) {
  if (keys.length === 0) return false
  const parsed = keys.map(parseKey)
  const minRow = Math.min(...parsed.map(p => p.row))
  const maxRow = Math.max(...parsed.map(p => p.row))
  const minCol = Math.min(...parsed.map(p => p.col))
  const maxCol = Math.max(...parsed.map(p => p.col))

  const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1)
  if (keys.length !== expectedCount) return false

  const keySet = new Set(keys)
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (!keySet.has(cellKey(r, c))) return false
    }
  }
  return true
}

// 선택된 셀 목록 전체가 병합 가능한지 (직사각형 형성 여부)
export function canMergeAll(merges, selectedKeys) {
  if (selectedKeys.length < 2) return false

  // 각 선택 셀의 root 그룹에 속한 모든 셀 수집
  const rootsSeen = new Set()
  const allCells = new Set()

  selectedKeys.forEach(key => {
    const root = find(merges, key)
    if (!rootsSeen.has(root)) {
      rootsSeen.add(root)
      getAllCells(merges, root).forEach(k => allCells.add(k))
    }
  })

  return formsRectangle([...allCells])
}

// 기존 canMerge (두 셀 간) - handleMerge에서 사용
export function canMerge(merges, a, b, rows, cols) {
  const rootA = find(merges, a)
  const rootB = find(merges, b)
  if (rootA === rootB) return false

  const groupA = getAllCells(merges, rootA)
  const groupB = getAllCells(merges, rootB)
  return formsRectangle([...groupA, ...groupB])
}

export function getSpan(merges, root) {
  const cells = getAllCells(merges, root)
  if (cells.length === 0) return { rowSpan: 1, colSpan: 1 }
  const parsed = cells.map(parseKey)
  const minRow = Math.min(...parsed.map(p => p.row))
  const maxRow = Math.max(...parsed.map(p => p.row))
  const minCol = Math.min(...parsed.map(p => p.col))
  const maxCol = Math.max(...parsed.map(p => p.col))
  return {
    rowSpan: maxRow - minRow + 1,
    colSpan: maxCol - minCol + 1,
  }
}

export function initMerges(rows, cols) {
  const merges = {}
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = cellKey(r, c)
      merges[k] = k
    }
  }
  return merges
}