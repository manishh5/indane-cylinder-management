import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const BASE_URL = "https://indane-cylinder-management.onrender.com";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
    const finalUrl = `${BASE_URL}${url.startsWith("/api") ? "" : "/api"}${url}`;

    // ✅ ADD THIS LINE
    console.log("API REQUEST →", finalUrl);

    const res = await fetch(finalUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;
    const finalUrl = `${BASE_URL}${path.startsWith("/api") ? "" : "/api"}${path}`;

    // ✅ ADD THIS
    console.log("QUERY REQUEST →", finalUrl);

    const res = await fetch(finalUrl, {
      credentials: "include",
    });
    

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
