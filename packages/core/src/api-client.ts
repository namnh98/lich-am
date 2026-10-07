export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  fetchImplementation?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

export function createApiClient(options: ApiClientOptions) {
  const requestFetch = options.fetchImplementation ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const token = await options.getAccessToken?.();
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const response = await requestFetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
        ...init,
        headers,
      });
      const payload = response.status === 204 ? undefined : await response.json();
      if (!response.ok) throw new ApiError(response.status, payload);
      return payload as T;
    },
  };
}
