const HA_BASE = import.meta.env.VITE_BACKEND_URL || 'https://mekaniprijatelj.onrender.com';

const headers = {
  "Content-Type": "application/json",
};

const ENTITY_HAPPINESS = "counter.razina_srece";
const ENTITY_NAME = "input_text.toyname";
const ENTITY_SOUND = "input_number.zvucnik";
const ENTITY_ACTIVATION = "input_boolean.medvjedic_aktivan";

export async function getState(entityId) {
  const res = await fetch(`${HA_BASE}/api/states/${entityId}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return res.json();
}

export async function setState(entityId, state, attributes = {}) {
  const res = await fetch(`${HA_BASE}/api/states/${entityId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ state, attributes }),
  });
  console.log("VIC");

  // LOG: Ispisujemo status da vidimo je li 200 OK, 404, 401 itd.
  console.log(`Dohvaćam ${entityId} - Status:`, res.status);

  if (!res.ok) {
    console.warn(`Greška! Status nije OK za ${entityId}`);
    return null;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.warn(`Greška! Content-Type nije JSON za ${entityId}:`, contentType);
    return null;
  }

  const data = await res.json();
  // LOG: Ispisujemo točne podatke koje nam Home Assistant šalje
  console.log(`Podaci za ${entityId}:`, data);

  return data;
  return res.ok;
}

export async function callService(domain, service, data) {
  const res = await fetch(`${HA_BASE}/api/services/${domain}/${service}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function getPlushieHappiness() {
  const s = await getState(ENTITY_HAPPINESS);
  return s ? Math.round(parseFloat(s.state)) : null;
}

export async function getPlushieName() {
  const s = await getState(ENTITY_NAME);
  return s ? s.state : null;
}

export async function setPlushieName(name) {
  return callService("input_text", "set_value", {
    entity_id: ENTITY_NAME,
    value: name,
  });
}

export async function playSound(happiness){
  return callService("input_number", "set_value", {
    entity_id: ENTITY_SOUND,
    value: happiness,
  });
}

export async function activatePlushie() {
  // return setState(ENTITY_ACTIVATION, "on");
  const res = await fetch(`${HA_BASE}/api/states/${ENTITY_ACTIVATION}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ value: "on" }), 
  });
  
  return res.ok;
}