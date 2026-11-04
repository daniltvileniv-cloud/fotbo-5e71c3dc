// ─── Parser for tab-separated rows pasted from Excel ────────────────────
// Expected column order (same as the tables):
//   Підрозділ → Звання → Посада → ПІБ → [Оцінка → Бал]
// A leading № column (pure digits) and header rows are skipped
// automatically. If a pasted row happens to have ПІБ before Посада,
// the parser detects which cell is the name and fixes it, so the copy
// order from Excel never puts a position into the ПІБ column.

const RANKS = [
  'солдат',
  'старший солдат',
  'молодший сержант',
  'сержант',
  'старший сержант',
  'головний сержант',
  'штаб-сержант',
  'ст.сержант',
  'старшина',
  'прапорщик',
  'старший прапорщик',
  'молодший лейтенант',
  'лейтенант',
  'старший лейтенант',
  'капітан',
  'майор',
  'підполковник',
  'полковник',
  'бригадний генерал',
  'генерал-майор',
  'генерал-лейтенант',
  'генерал',
  'курсант',
  'військовослужбовець',
]

const GRADES = [
  'високий',
  'середній',
  'низький',
  'не здав',
  'не склав',
  'незадовільно',
  'відмінно',
  'відмінний',
  'добре',
  'задовільно',
  'зараховано',
  'не зараховано',
]

// Remove dots, dashes and spaces so "Ст.Сержант" == "стсержант".
const compact = (s) => s.toLowerCase().replace(/[\s.\-–—]/g, '')

const RANK_SET = new Set(RANKS.map(compact))
const GRADE_SET = new Set(GRADES.map(compact))

const SCORE_RE = /^\d{1,3}\s*\/\s*\d{1,3}$/

// A full name: 2–4 words, every word starts with an uppercase letter,
// no digits, no commas (positions usually contain commas or digits or
// lowercase words, so they never match).
function looksLikeName(s) {
  if (!s || s.length > 70) return false
  if (/,/.test(s) || /\d/.test(s)) return false
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 4) return false
  return words.every((w) => /^[А-ЯІЇЄҐA-Z]/.test(w))
}

function looksLikeUnit(s) {
  if (s.length > 14) return false
  // "2 БОП", "3 ЗРАДн", "1 БОП"
  if (/^\d{1,2}\s+[А-ЯІЇЄҐA-Z][А-ЯІЇЄҐA-Za-z]{1,7}$/.test(s)) return true
  // "ББС", "АДН", "ВЗ", "ТР", "РРЕБ", "ББпС", "ЗРАДн", "БП"
  return /^[А-ЯІЇЄҐA-Z][А-ЯІЇЄҐA-Za-z]{1,7}$/.test(s)
}

function looksLikeDateRange(s) {
  return /^\d{1,2}\.\d{1,2}\.\d{2,4}\s*[-–—]\s*\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(s.trim())
}

function isHeaderLine(parts) {
  const lower = parts.join(' ').toLowerCase()
  return /№|з\/п|піб|прізвище|звання|посада|оцінювання|оцінка|бал|підрозділ/.test(lower)
}

// Classify one pasted cell.
function classifyCell(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return null
  if (/^\d+$/.test(s)) return 'number'
  if (SCORE_RE.test(s)) return 'score'
  const c = compact(s)
  if (GRADE_SET.has(c)) return 'grade'
  if (RANK_SET.has(c)) return 'rank'
  if (looksLikeName(s)) return 'name'
  if (looksLikeUnit(s)) return 'unit'
  return 'position'
}

// Parse a single tab-separated line into a record.
// Order: Підрозділ → Звання → Посада → ПІБ → [Оцінка → Бал]
function parseLine(parts) {
  const row = { unit: '', rank: '', fullName: '', position: '', grade: '', score: '' }

  // Drop a leading № column (pure digits).
  const cells = parts.filter((p) => !/^\d+$/.test(p))
  if (!cells.length) return row

  // 1) Підрозділ — перша клітинка (якщо це не звання).
  let start = 0
  if (classifyCell(cells[0]) === 'rank') {
    row.unit = ''
  } else {
    row.unit = cells[0]
    start = 1
  }

  // 2) Звання — перша наступна клітинка, що схожа на звання.
  let rankIdx = -1
  for (let i = start; i < cells.length; i++) {
    if (classifyCell(cells[i]) === 'rank') {
      rankIdx = i
      break
    }
  }

  let rest
  if (rankIdx >= 0) {
    row.rank = cells[rankIdx]
    rest = cells.slice(rankIdx + 1)
  } else {
    // Звання не знайдено — беремо решту після підрозділу.
    rest = cells.slice(start)
  }

  // 5–6) Оцінка та бал розпізнаються за вмістом.
  const gradeCell = rest.find((c) => classifyCell(c) === 'grade')
  const scoreCell = rest.find((c) => classifyCell(c) === 'score')
  row.grade = gradeCell || ''
  row.score = scoreCell || ''

  // 3–4) Посада та ПІБ — клітинки, що лишились, у порядку з Excel.
  const middle = rest.filter((c) => {
    const t = classifyCell(c)
    return t !== 'grade' && t !== 'score'
  })

  if (middle.length >= 2) {
    const [a, b] = middle
    const aIsName = looksLikeName(a)
    const bIsName = looksLikeName(b)
    if (aIsName && !bIsName) {
      // Порядок з Excel: … ПІБ, Посада — міняємо місцями.
      row.fullName = a
      row.position = b
    } else {
      // Порядок як у таблиці: … Посада, ПІБ.
      row.position = a
      row.fullName = b
    }
  } else if (middle.length === 1) {
    if (looksLikeName(middle[0])) row.fullName = middle[0]
    else row.position = middle[0]
  }

  return row
}

// Parse pasted multi-line text into an array of records.
export function parsePastedLines(text) {
  const results = []
  const lines = String(text ?? '').split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (looksLikeDateRange(line)) continue

    const parts = line.split('\t').map((s) => s.trim())
    const nonEmpty = parts.filter(Boolean)
    if (nonEmpty.length === 0) continue
    if (isHeaderLine(nonEmpty)) continue

    const row = parseLine(nonEmpty)
    const hasData = row.unit || row.rank || row.fullName || row.position || row.grade || row.score
    if (hasData) results.push(row)
  }

  return results
}