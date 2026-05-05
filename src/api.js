const API_PREFIX = '/api';
const DEMO_USER_KEY = 'teach_and_study_demo_user';

// Utility helper for delay (Exponential Backoff)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper for fetch with retry logic for HTTP 429 errors
async function request(path, options = {}, retries = 3) {
  const url = `${API_PREFIX}${path}`;
  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, fetchOptions);

      // Handle Rate Limiting (HTTP 429)
      if (res.status === 429) {
        if (i === retries) {
            const err = new Error("API Rate Limit Exceeded. Please try again later.");
            err.status = 429;
            throw err;
        }
        
        // Exponential backoff: 5s, 10s, 15s
        const delay = 5000 * (i + 1); 
        console.warn(`[API] 429 Too Many Requests. Retrying in ${delay / 1000}s...`);
        
        await wait(delay);
        continue;
      }

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const err = new Error(data?.error || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;

    } catch (err) {
      if (err.status) throw err; // Re-throw strict API errors
      if (i === retries) throw err; // Re-throw network errors on last attempt
      await wait(2000); // Small delay for network jitters
    }
  }
}

function nameFromEmail(email) {
  const local = String(email || "").split("@")[0] || "Guest";
  const parts = local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean);

  const format = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";
  return {
    first_name: format(parts[0]) || "Guest",
    last_name: format(parts.slice(1).join(" ")) || "",
  };
}

function createDemoUser(email, payload = {}) {
  const derived = nameFromEmail(email);
  const user = {
    id: 'demo-user',
    email,
    first_name: payload.first_name || derived.first_name,
    last_name: payload.last_name || derived.last_name,
    role: payload.role || 'teacher',
    coins: 120,
    achievements: [],
    is_demo: true,
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  return user;
}

function getDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user?.first_name === "Teach" && user?.last_name === "Study") {
      const derived = nameFromEmail(user.email);
      const migrated = { ...user, ...derived };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return user;
  } catch {
    return null;
  }
}

function isBackendUnavailable(err) {
  return !err?.status || err.status >= 500;
}

const api = {
  request,

  async login(email, password) {
    try {
      return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      if (!isBackendUnavailable(err)) throw err;
      const existing = getDemoUser();
      if (existing?.email === email) return { ok: true, demo: true };
      createDemoUser(email, { source: "login" });
      return { ok: true, demo: true };
    }
  },

  async signup(email, password, payload = null) {
    const extra = (payload && typeof payload === "object") ? payload : { displayName: payload };
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, ...extra })
      });
    } catch (err) {
      if (!isBackendUnavailable(err)) throw err;
      const user = createDemoUser(email, extra);
      return { userId: user.id, demo: true };
    }
  },

  async me() {
    try {
      return await request('/me');
    } catch (err) {
      const demoUser = getDemoUser();
      if (demoUser && (err?.status === 401 || isBackendUnavailable(err))) {
        return { user: demoUser, demo: true };
      }
      throw err;
    }
  },

  async logout() {
    localStorage.removeItem(DEMO_USER_KEY);
    try {
      return await request('/auth/logout', {
        method: 'POST'
      });
    } catch (err) {
      if (!isBackendUnavailable(err)) throw err;
      return { ok: true, demo: true };
    }
  },

  // Stream generation with retry support
  generateStream: async function* ({ prompt }) {
    let res;
    const retries = 3;

    for (let i = 0; i <= retries; i++) {
        res = await fetch(`/api/generate/stream`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (res.status === 429) {
            if (i === retries) throw new Error("HTTP 429: Service Busy");
            
            const delay = 5000 * (i + 1);
            console.warn(`[Stream] 429 Detected. Retrying in ${delay / 1000}s...`);
            await wait(delay);
            continue;
        }
        break;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const chunk = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        const line = chunk.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;

        const payload = line.slice(6);
        let evt;
        try { evt = JSON.parse(payload); } catch { continue; }

        if (evt.type === "delta") yield (evt.text || "");
        if (evt.type === "done") return;
        if (evt.type === "error") throw new Error(evt.message || "stream error");
      }
    }
  },

  generations: {
    list: (limit = 50) => request(`/generations?limit=${encodeURIComponent(limit)}`, { method: 'GET' }),
    get: (id) => request(`/generations/${id}`, { method: 'GET' }),
    create: (payload) => request(`/generations`, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/generations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: async (id) => { await request(`/generations/${id}`, { method: 'DELETE' }); return true; }
  },



  generateFourPicturesRound(payload) {
    return request('/games/four-pictures/generate', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  },

  promptConfig: {
    get: () => request('/prompt-config', { method: 'GET' }),
    set: (config) => request('/prompt-config', { method: 'PUT', body: JSON.stringify({ config }) }),
  }
};

export default api;
