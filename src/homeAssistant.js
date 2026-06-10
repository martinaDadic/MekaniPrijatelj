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
  callService("input_boolean", "set_value", {
    entity_id: ENTITY_ACTIVATION,
    value: "on"
  });
}