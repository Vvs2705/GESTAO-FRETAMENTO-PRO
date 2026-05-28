export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.gestaofretamento.local/v1";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

export async function request(path: string, options: ApiRequestOptions = {}): Promise<any> {
  const { params, headers, ...init } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    url = `${url}?${searchParams.toString()}`;
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const mergedHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...Object.fromEntries(new Headers(headers).entries()),
  };

  try {
    const response = await fetch(url, {
      ...init,
      headers: mergedHeaders,
    });

    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              localStorage.setItem("accessToken", data.accessToken);
              localStorage.setItem("refreshToken", data.refreshToken);
              onRefreshed(data.accessToken);
              isRefreshing = false;
              mergedHeaders["Authorization"] = `Bearer ${data.accessToken}`;
              const retryResponse = await fetch(url, { ...init, headers: mergedHeaders });
              return await handleResponse(retryResponse);
            } else {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
            }
          } catch (err) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              mergedHeaders["Authorization"] = `Bearer ${newToken}`;
              resolve(fetch(url, { ...init, headers: mergedHeaders }).then(handleResponse));
            });
          });
        }
      }
    }

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Erro de conexão com o servidor.");
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (_) {}
    throw new ApiError(
      response.status,
      errorData?.message || "Ocorreu um erro na requisição.",
      errorData
    );
  }

  if (response.status === 204) return null;
  return response.json();
}
