const HA_TOKEN = import.meta.env.VITE_HA_TOKEN
const HA_URL = import.meta.env.VITE_HA_URL ?? '' 

const headers = {
  'Authorization': `Bearer ${HA_TOKEN}`,
  'Content-Type': 'application/json',
}

const ENTITY_ACTIVATED = 'input_boolean.medvjedic_aktivan'
const ENTITY_HAPPINESS = 'counter.razina_srece'
const ENTITY_NAME = 'input_text.toyname'

export async function getState(entityId) {
  const res = await fetch(`/api/states/${entityId}`, { headers })
  if (!res.ok) return null
  return res.json()
}

export async function setState(entityId, state, attributes = {}) {
  const res = await fetch(`/api/states/${entityId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ state, attributes }),
  })
  return res.ok
}

export async function callService(domain, service, data) {
  const res = await fetch(`/api/services/${domain}/${service}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  return res.ok
}

export async function getPlushieHappiness() {
  const s = await getState(ENTITY_HAPPINESS)
  return s ? Math.round(parseFloat(s.state)) : null
}

export async function getPlushieName() {
  const s = await getState(ENTITY_NAME)
  return s ? s.state : null
}

export async function setPlushieName(name) {
  await setState(ENTITY_ACTIVATED, 'on')

  return callService('input_text', 'set_value', {
    entity_id: ENTITY_NAME,
    value: name,
  })
}

export async function createPlushie(name) {
  await setState(ENTITY_NAME, name)
  await setState(ENTITY_HAPPINESS, '3')
  return true
}