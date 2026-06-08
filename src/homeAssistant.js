const HA_TOKEN = import.meta.env.VITE_HA_TOKEN;

const headers = {
  Authorization: `Bearer ${HA_TOKEN}`,
  "Content-Type": "application/json",
};

async function haGet(path) {
  const res = await fetch(`/api${path}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`HA ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

async function haPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HA ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

function getNameEntity(id) {
  switch (id) {
    case 2:
      return "input_text.toyname";
    default:
      throw new Error(`Unsupported plushie ID: ${id}`);
  }
}

export async function getPlushie(id) {
  if (id !== 2) return null;

  try {
    const [happinessState, nameState] = await Promise.all([
      haGet("/states/counter.razina_srece"),
      haGet("/states/input_text.toyname"),
    ]);

    return {
      id,
      name: nameState.state?.trim() || `Ljubimac ${id}`,
      happiness: Number(happinessState.state) || 0,
    };
  } catch (error) {
    console.error("Failed to fetch plushie:", error);
    return null;
  }
}

export async function createPlushie(id, name) {
  const existing = await getPlushie(id);

  if (!existing) {
    throw new Error(
      `Ljubimac s ID-om ${id} ne postoji u Home Assistantu.`
    );
  }

  await haPost("/services/input_text/set_value", {
    entity_id: getNameEntity(id),
    value: name.trim(),
  });

  return refreshPlushie(id);
}

export async function renamePlushie(id, newName) {
  if (!newName?.trim()) {
    throw new Error("Ime ne smije biti prazno.");
  }

  await haPost("/services/input_text/set_value", {
    entity_id: getNameEntity(id),
    value: newName.trim(),
  });

  return refreshPlushie(id);
}

export async function refreshPlushie(id) {
  return getPlushie(id);
}

export async function checkConnection() {
  try {
    await haGet("/config");
    return true;
  } catch (error) {
    console.error("Home Assistant connection failed:", error);
    return false;
  }
}