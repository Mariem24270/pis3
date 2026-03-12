export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const MEDIA_BASE_URL = "http://127.0.0.1:8000";

export function apiUrl(path) {
  const p = String(path || "").replace(/^\/+/, "");
  return `${API_BASE_URL}/${p}`;
}

export function getAccessToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
}

export function authHeaders(extra = {}) {
  const token = getAccessToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

