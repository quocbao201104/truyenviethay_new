import axios from "@/utils/axios";
import type { AxiosRequestConfig } from "axios";

type CacheEntry<T> = {
  data: T;
  expires: number;
};

type CacheOptions = {
  ttlMs?: number;
  dedupe?: boolean;
  abortKey?: string;
};

const responseCache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();
const abortControllers = new Map<string, AbortController>();

const buildKey = (url: string, params?: Record<string, any>) => {
  if (!params) return url;
  const search = new URLSearchParams();
  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v === undefined || v === null || v === "") return;
      search.append(k, String(v));
    });
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
};

export const cachedGet = async <T>(
  url: string,
  config: AxiosRequestConfig = {},
  options: CacheOptions = {},
): Promise<T> => {
  const ttlMs = options.ttlMs ?? 15000;
  const dedupe = options.dedupe ?? true;
  const key = buildKey(url, (config.params as Record<string, any>) || undefined);

  const cached = responseCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }

  if (dedupe && inFlight.has(key)) {
    return (await inFlight.get(key)) as T;
  }

  if (options.abortKey) {
    const prev = abortControllers.get(options.abortKey);
    if (prev) prev.abort();
    abortControllers.set(options.abortKey, new AbortController());
    config.signal = abortControllers.get(options.abortKey)!.signal;
  }

  const req = axios
    .get<T>(url, config)
    .then((res) => {
      responseCache.set(key, { data: res.data, expires: Date.now() + ttlMs });
      return res.data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  if (dedupe) inFlight.set(key, req);
  return req;
};

export const prefetchGet = async <T>(
  url: string,
  config: AxiosRequestConfig = {},
  options: CacheOptions = {},
): Promise<void> => {
  try {
    await cachedGet<T>(url, config, options);
  } catch {
    // Prefetch failures are non-blocking
  }
};

export const clearRequestCache = (prefix?: string) => {
  if (!prefix) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) responseCache.delete(key);
  }
};
