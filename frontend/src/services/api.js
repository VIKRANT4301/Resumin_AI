import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000/api/matcher";
export const SESSION_KEY = "prores_session";

export function createAuthorizedApi(token = "") {
  return axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function restoreStoredSession() {
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) {
    return null;
  }

  const parsed = JSON.parse(stored);
  const response = await axios.get(`${API_BASE}/auth/session`, {
    headers: { Authorization: `Bearer ${parsed.token}` },
  });
  const auth = response.data.auth;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
  return auth;
}
