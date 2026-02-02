const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const token = this.getToken();

    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // Only redirect on 401 if user was previously authenticated
      // Don't redirect during login/register attempts
      if (response.status === 401 && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      throw new Error(data.message || "Erro na requisição");
    }

    return data;
  }

  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ) {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_URL);
