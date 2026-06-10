const HA_BASE =
  import.meta.env.VITE_BACKEND_URL || "https://mekaniprijatelj.onrender.com";

const headers = {
  "Content-Type": "application/json",
};

const ENTITY_HAPPINESS = "counter.razina_srece";
const ENTITY_NAME = "input_text.toyname";
const ENTITY_SOUND = "input_number.zvucnik";
const ENTITY_ACTIVATION = "input_boolean.medvjedic_aktivan";

const V_ENTITY_HAPPINESS = "counter.v_razina_srece";
const V_ENTITY_NAME = "input_text.v_toyname";
const V_ENTITY_SOUND = "input_number.v_zvucnik";
const V_ENTITY_ACTIVATION = "input_boolean.v_medvjedic_aktivan";


function getBearEntities(id) {
  if (id === 1) {
    return {
      happiness: V_ENTITY_HAPPINESS,
      name: V_ENTITY_NAME,
      sound: V_ENTITY_SOUND,
      activation: V_ENTITY_ACTIVATION,
    };
  }

  if (id === 2) {
    return {
      happiness: ENTITY_HAPPINESS,
      name: ENTITY_NAME,
      sound: ENTITY_SOUND,
      activation: ENTITY_ACTIVATION,
    };
  }

  throw new Error("Invalid bear id.");
}

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


export async function getPlushieHappiness(id) {
  const entities = getBearEntities(id);

  const state = await getState(entities.happiness);

  return state ? Math.round(parseFloat(state.state)) : null;
}


export async function getPlushieName(id) {
  const entities = getBearEntities(id);

  const state = await getState(entities.name);

  return state ? state.state : null;
}

export async function setPlushieName(id, name) {
  const entities = getBearEntities(id);

  return callService("input_text", "set_value", {
    entity_id: entities.name,
    value: name,
  });
}

export async function playSound(id, happiness) {
  const entities = getBearEntities(id);

  return callService("input_number", "set_value", {
    entity_id: entities.sound,
    value: happiness,
  });
}

export async function activatePlushie() {
  return callService("input_boolean", "turn_on", {
    entity_id: ENTITY_ACTIVATION,
  });
}
