
// UI Components optimization - only import what we need
import { lazy } from 'react';

// Lazy load heavy UI components
export const LazyDialog = lazy(() => 
  import('@/components/ui/dialog').then(module => ({
    default: module.Dialog
  }))
);

export const LazyDropdownMenu = lazy(() => 
  import('@/components/ui/dropdown-menu').then(module => ({
    default: module.DropdownMenu
  }))
);

export const LazyAccordion = lazy(() => 
  import('@/components/ui/accordion').then(module => ({
    default: module.Accordion
  }))
);

export const LazyChart = lazy(() => 
  import('@/components/ui/chart').then(module => ({
    default: module.ChartContainer
  }))
);

// Create a lightweight loading placeholder for UI components
export const UIComponentSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
  </div>
);

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
