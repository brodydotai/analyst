export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const buildUrl = (path: string) => {
  if (!apiBaseUrl) {
    return path;
  }
  return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error ?? data.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

export const fetchJson = async <T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};
