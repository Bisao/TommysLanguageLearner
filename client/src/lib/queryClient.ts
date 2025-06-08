
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests with exponential backoff
      retry: (failureCount, error: any) => {
        // Don\'t retry on 4xx errors except timeout
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
          return false;
        }
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data only
      refetchOnWindowFocus: (query) => {
        return query.queryKey[0] === 
'/api/user'
;
      },
      // Background refetch for better UX
      refetchOnMount: 
'always'
,
      // Network mode for better offline support
      networkMode: 
'offlineFirst'
,
    },
    mutations: {
      // Retry mutations with delay
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: 1000,
      // Network mode for mutations
      networkMode: 
'online'
,
    },
  },
});

// Preload critical queries
export const preloadCriticalData = async () => {
  try {
    // Preload user data
    await queryClient.prefetchQuery({
      queryKey: [
'/api/user'
],
      queryFn: () => fetch("/api/user").then(res => res.json()),
      staleTime: 10 * 60 * 1000, // 10 minutes for user data
    });

    // Preload lessons data
    await queryClient.prefetchQuery({
      queryKey: [
'/api/lessons'
],
      queryFn: () => fetch("/api/lessons").then(res => res.json()),
      staleTime: 30 * 60 * 1000, // 30 minutes for lessons (more static)
    });
  } catch (error) {
    console.warn(
'Failed to preload critical data:'
, error);
  }
};

// Invalidate cache for specific data types
export const invalidateUserData = () => {
  queryClient.invalidateQueries({ queryKey: [
'/api/user'
] });
  queryClient.invalidateQueries({ queryKey: [
'/api/progress'
] });
  queryClient.invalidateQueries({ queryKey: [
'/api/stats/daily'
] });
};

export const invalidateLessonsData = () => {
  queryClient.invalidateQueries({ queryKey: [
'/api/lessons'
] });
};

// API Request utility function
export const apiRequest = async (method: string, url: string, data?: any) => {
  const options: RequestInit = {
    method,
    headers: {
      
'Content-Type'
: 
'application/json'
,
    },
    credentials: 
'include'
, // Include cookies for session management
  };

  if (data && method !== 
'GET'
) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
};

// Query function generator for React Query
export const getQueryFn = (options?: { on401?: "returnNull" | "throw" }) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        credentials: 
'include'
,
        signal: controller.signal,
        headers: {
          
'Cache-Control'
: 
'no-cache'
,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        if (options?.on401 === "returnNull") {
          return null;
        }
        throw new Error(
'Unauthorized'
);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(
'Query error:'
, error);
      
      if (error.name === 
'AbortError'
) {
        throw new Error(
'Request timeout - please check your connection'
);
      }
      
      throw error;
    }
  };
};


