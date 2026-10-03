import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'
import YAML from 'yaml'

const root = process.cwd()
const casesDir = path.join(root, 'content', 'cases')
const generatedDir = path.join(root, 'generated')
const validateOnly = process.argv.includes('--validate-only')
const showDrafts = process.env.SHOW_DRAFTS !== 'false'
const errors = []
const warnings = []

const fail = (file, message) => errors.push(`${path.relative(root, file)}: ${message}`)
const warn = (file, message) => warnings.push(`${path.relative(root, file)}: ${message}`)
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string')
// gray-matter's YAML parser materializes unquoted ISO dates as Date objects.
// Convert that parser representation back to the source's date-only form for
// validation and generated JSON; source files themselves remain untouched.
const dateString = (value) => value instanceof Date && !Number.isNaN(value.valueOf())
  ? value.toISOString().slice(0, 10)
  : value
const validDate = (value) => {
  const normalized = dateString(value)
  return typeof normalized === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(normalized) && !Number.isNaN(Date.parse(`${normalized}T00:00:00Z`))
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(location) : [location]
  })
}

function loadYaml(candidates, label, fallback) {
  const file = candidates.map((name) => path.join(root, name)).find(fs.existsSync)
  if (!file) {
    warnings.push(`${label}: no source file found`)
    return { file: candidates[0], value: fallback }
  }
  try {
    return { file, value: YAML.parse(fs.readFileSync(file, 'utf8')) ?? fallback }
  } catch (error) {
    fail(file, `invalid YAML (${error.message})`)
    return { file, value: fallback }
  }
}

const legislationSource = loadYaml(['data/legislation.yml', 'data/legislation.yaml', 'legislation.yml', 'legislation.yaml'], 'Legislation registry', {})
const featuredSource = loadYaml(['data/featured-questions.yml', 'data/featured_questions.yaml', 'data/featured-questions.yaml'], 'Featured questions', [])
const aboutFile = path.join(root, 'data', 'about.md')
let about = null
if (!fs.existsSync(aboutFile)) {
  fail(aboutFile, 'authoritative About page source is missing')
} else {
  try {
    const parsed = matter(fs.readFileSync(aboutFile, 'utf8'))
    if (typeof parsed.data.title !== 'string' || !parsed.data.title.trim()) fail(aboutFile, 'required field “title” must be a non-empty string')
    if (typeof parsed.data.subtitle !== 'string' || !parsed.data.subtitle.trim()) fail(aboutFile, 'required field “subtitle” must be a non-empty string')
    about = { title: parsed.data.title, subtitle: parsed.data.subtitle, bodyHtml: marked.parse(parsed.content) }
  } catch (error) {
    fail(aboutFile, `could not parse About page (${error.message})`)
  }
}
const caseFiles = fs.existsSync(casesDir) ? walk(casesDir) : []
const cases = []
const ids = new Map()

for (const file of caseFiles) {
  let parsed
  try {
    parsed = matter(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    fail(file, `unparseable front matter (${error.message})`)
    continue
  }
  const sourceData = parsed.data
  const data = {
    ...sourceData,
    decision_date: dateString(sourceData.decision_date),
    editorial: sourceData.editorial ? {
      ...sourceData.editorial,
      created_date: dateString(sourceData.editorial.created_date),
      last_updated: dateString(sourceData.editorial.last_updated),
      last_verified_against_source: dateString(sourceData.editorial.last_verified_against_source),
    } : sourceData.editorial,
  }
  for (const field of ['id', 'title', 'citation', 'jurisdiction', 'court']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) fail(file, `required field “${field}” must be a non-empty string`)
  }
  if (!data.decision_date) fail(file, 'required field “decision_date” must be present')
  else if (!validDate(data.decision_date)) fail(file, 'decision_date must be a valid ISO date (YYYY-MM-DD)')
  for (const field of ['public_health_functions', 'topics', 'diseases_or_hazards', 'settings', 'public_health_roles']) {
    if (!isStringArray(data[field])) fail(file, `${field} must be an array of strings`)
  }
  for (const field of ['legislation', 'relationships', 'public_health_organizations']) {
    if (!Array.isArray(data[field])) fail(file, `${field} must be an array`)
  }
  if (data.id) {
    if (ids.has(data.id)) fail(file, `duplicate id “${data.id}” (also in ${path.relative(root, ids.get(data.id))})`)
    ids.set(data.id, file)
  }
  if (data.editorial) {
    for (const field of ['created_date', 'last_updated', 'last_verified_against_source']) {
      if (data.editorial[field] && !validDate(data.editorial[field])) fail(file, `editorial.${field} must be a valid ISO date`)
    }
  }

  const tokens = marked.lexer(parsed.content)
  const sections = {}
  let active = null
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 2) {
      active = token.text
      sections[active] = ''
    } else if (active && 'raw' in token) sections[active] += token.raw
  }
  const summaryKey = Object.keys(sections).find((key) => key.toLowerCase() === '30-second read')
  const whyKey = Object.keys(sections).find((key) => key.toLowerCase().startsWith('why this matters'))
  const plain = (markdown = '') => markdown.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim()
  const legislation = Array.isArray(data.legislation) ? data.legislation : []
  const organizations = Array.isArray(data.public_health_organizations) ? data.public_health_organizations : []
  const provisions = legislation.flatMap((item) => Array.isArray(item?.provisions) ? item.provisions : [])
  const provisionAliases = provisions.flatMap((item) => {
    const number = String(item).toLowerCase().replace(/^section\s*/i, '').replace(/^s\.?\s*/i, '')
    return [`s${number}`, `s.${number}`, `s. ${number}`, `section ${number}`]
  })

  cases.push({
    ...data,
    bodyHtml: marked.parse(parsed.content),
    summary: plain(sections[summaryKey]),
    whyItMatters: plain(sections[whyKey]),
    searchText: [data.title, data.citation, plain(sections[summaryKey]), plain(sections[whyKey]), ...(data.topics ?? []), ...(data.public_health_functions ?? []), ...(data.diseases_or_hazards ?? []), ...(data.settings ?? []), ...legislation.flatMap((item) => [item?.statute, item?.short_name, item?.citation, ...(item?.provisions ?? [])]), ...provisionAliases, ...organizations.map((item) => item?.name), ...(data.public_health_roles ?? [])].filter(Boolean).join(' '),
    sourcePath: path.relative(root, file),
  })
}

for (const item of cases) {
  for (const relation of item.relationships ?? []) {
    if (!relation || typeof relation.type !== 'string' || typeof relation.target_id !== 'string') {
      fail(ids.get(item.id) ?? casesDir, 'each relationship requires string type and target_id')
    } else if (!ids.has(relation.target_id)) warn(ids.get(item.id), `relationship target “${relation.target_id}” does not resolve; public link omitted`)
  }
  for (const statute of item.legislation ?? []) {
    if (statute?.short_name && !legislationSource.value[statute.short_name]) warn(ids.get(item.id), `legislation “${statute.short_name}” is missing from the registry`)
  }
}

const featured = Array.isArray(featuredSource.value) ? featuredSource.value.filter((item) => {
  if (!item || typeof item.question !== 'string' || typeof item.target_id !== 'string') {
    fail(featuredSource.file, 'each featured question requires string question and target_id')
    return false
  }
  if (!ids.has(item.target_id)) {
    warn(featuredSource.file, `target “${item.target_id}” does not resolve; question omitted`)
    return false
  }
  return true
}) : (fail(featuredSource.file, 'featured questions must be an array'), [])

const visibleCases = cases.filter((item) => showDrafts || !['draft', 'stub'].includes(item.editorial?.status))
const visibleIds = new Set(visibleCases.map((item) => item.id))
const output = {
  cases: visibleCases,
  legislation: legislationSource.value,
  featuredQuestions: featured.filter((item) => visibleIds.has(item.target_id)),
  about,
  build: { showDrafts },
}

for (const message of warnings) console.warn(`warning: ${message}`)
if (errors.length) {
  for (const message of errors) console.error(`error: ${message}`)
  process.exitCode = 1
} else if (!validateOnly) {
  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(path.join(generatedDir, 'content.json'), `${JSON.stringify(output, null, 2)}\n`)
  console.log(`Generated ${visibleCases.length} cases (${cases.length - visibleCases.length} hidden) with ${warnings.length} warning(s).`)
} else {
  console.log(`Validated ${cases.length} cases with ${warnings.length} warning(s).`)
}
