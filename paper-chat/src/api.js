// The single "phone line" to the backend. Every request goes through api().
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let token = localStorage.getItem("token");
let onExpired = () => {};

export const getToken = () => token;
export const setOnExpired = (fn) => { onExpired = fn; };
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

export async function api(path, opts = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    });
  } catch {
    throw new Error(`Can’t reach the server at ${API_URL}. Is the backend running?`);
  }
  if (res.status === 401 && token) {
    setToken(null);
    onExpired();
    throw new Error("Your session expired. Please sign in again.");
  }
  if (!res.ok) {
    let msg = "Something went wrong. Try again.";
    try {
      const j = await res.json();
      if (typeof j.detail === "string") msg = j.detail;
    } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}
