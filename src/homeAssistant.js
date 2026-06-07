const HA_URL   = import.meta.env.VITE_HA_URL   || ''
const HA_TOKEN = import.meta.env.VITE_HA_TOKEN  || ''

const DB_ENTITY = 'input_text.mekani_prijatelji_db'

const headers = {
  Authorization: `Bearer ${HA_TOKEN}`,
  'Content-Type': 'application/json',
}

async function haGet(path) {
  const res = await fetch(`${HA_URL}/api${path}`, { headers })
  if (!res.ok) throw new Error(`HA GET ${path} → ${res.status}`)
  return res.json()
}

async function haPost(path, body) {
  const res = await fetch(`${HA_URL}/api${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HA POST ${path} → ${res.status}`)
  return res.json()
}

async function readDb() {
  try {
    const s = await haGet(`/states/${DB_ENTITY}`)
    return JSON.parse(s.state)
  } catch {
    return {}
  }
}

async function writeDb(db) {
  const raw = JSON.stringify(db)
  if (raw.length > 255) throw new Error('DB too large for input_text (>255 chars)')
  await haPost(`/services/input_text/set_value`, {
    entity_id: DB_ENTITY,
    value: raw,
  })
}

export async function getAllPlushies() {
  return readDb()
}

export async function getPlushie(id) {
  const db = await readDb()
  return db[id] ?? null
}

export async function createPlushie(id, name) {
  const db = await readDb()
  if (db[id]) throw new Error('ID already exists')
  db[id] = { name: name.trim(), happiness: 3 }
  await writeDb(db)
}

export async function updatePlushie(id, patch) {
  const db = await readDb()
  if (!db[id]) throw new Error('Plushie not found')
  db[id] = { ...db[id], ...patch }
  await writeDb(db)
}

export async function deletePlushie(id) {
  const db = await readDb()
  delete db[id]
  await writeDb(db)
}

export async function checkConnection() {
  try {
    await haGet('/states/' + DB_ENTITY)
    return true
  } catch {
    return false
  }
}
