const BASE = "/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  getProducts: (token) => request("/products", { token }),
  createProduct: (token, payload) => request("/products", { method: "POST", body: payload, token }),
  updateProduct: (token, id, payload) =>
    request(`/products/${id}`, { method: "PUT", body: payload, token }),
  deleteProduct: (token, id) => request(`/products/${id}`, { method: "DELETE", token }),

  getDashboard: (token) => request("/dashboard", { token }),

  getSettings: (token) => request("/settings", { token }),
  updateSettings: (token, payload) => request("/settings", { method: "PUT", body: payload, token }),
};
