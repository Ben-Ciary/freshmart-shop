const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const getToken = () => localStorage.getItem("shop_token");

export const saveToken = (token) => {
  localStorage.setItem("shop_token", token);
};

export const clearToken = () => {
  localStorage.removeItem("shop_token");
};

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.detail ||
      data.error ||
      Object.values(data).flat().join(" ") ||
      "Something went wrong";

    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}
