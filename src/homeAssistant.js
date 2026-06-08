const HA_TOKEN = import.meta.env.VITE_HA_TOKEN;

const headers = {
  Authorization: `Bearer ${HA_TOKEN}`,
  "Content-Type": "application/json",
};

async function haGet(path) {
  const res = await fetch(`/api${path}`, { headers });
  if (!res.ok) throw new Error(`HA ${res.status}: ${res.statusText}`);
  return res.json();
}

async function haPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

export async function getPlushie(id) {
  if(id == 2) {
    try {
      const [happinessState, nameState] = await Promise.all([
        haGet(`/states/counter.razina_srece`),
        haGet(`/states/input_text.toyname`),
      ]);

      const happiness = happinessState.state;
      const name = nameState.state?.trim() || `Ljubimac ${id}`;

      return { id, name, happiness };
    } catch {
      return null;
    }
  }
}

export async function createPlushie(id, name) {
  const existing = await getPlushie(id);
  if (!existing) throw new Error(`Ljubimac s ID-om ${id} ne postoji u Home Assistantu.`);

  await haPost(`/services/input_text/set_value`, {
    entity_id: nameEntity(id),
    value: name.trim(),
  });
}

export async function renamePlushie(id, newName) {
  if (!newName?.trim()) throw new Error("Ime ne smije biti prazno.");
  await haPost(`/services/input_text/set_value`, {
    entity_id: nameEntity(id),
    value: newName.trim(),
  });
}

export async function refreshPlushie(id) {
  return getPlushie(id);
}

export async function checkConnection() {
  try {
    await haGet("/config");
    return true;
  } catch {
    return false;
  }
}
