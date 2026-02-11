const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  health: () => request<{ status: string; binary: string; configured: boolean }>("/health"),

  // Auth
  validateCredentials: (username: string, password: string) =>
    request("/settings", {
      method: "PUT",
      body: JSON.stringify({ soulseek: { username, password } }),
    }),

  // Settings
  getSettings: () => request<Record<string, unknown>>("/settings"),
  updateSettings: (data: Record<string, unknown>) =>
    request("/settings", { method: "PUT", body: JSON.stringify(data) }),
  getSettingsStatus: () =>
    request<{ configured: boolean }>("/settings/status"),

  // Downloads
  createDownload: (data: {
    input: string;
    inputType?: string;
    downloadMode: string;
    flags?: Record<string, unknown>;
  }) =>
    request<Record<string, unknown>>("/downloads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDownloads: () => request<Record<string, unknown>[]>("/downloads"),
  getDownload: (id: string) =>
    request<Record<string, unknown>>(`/downloads/${id}`),
  cancelDownload: (id: string) =>
    request(`/downloads/${id}`, { method: "DELETE" }),
  previewDownload: (data: {
    input: string;
    flags?: Record<string, unknown>;
  }) =>
    request<{ output: string }>("/downloads/preview", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Upload
  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE}/upload/csv`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Upload failed");
    }
    return res.json();
  },
};
