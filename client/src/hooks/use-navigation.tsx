import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to handle smooth page transitions
 * Adds a "navigating" class to html when navigation starts and removes it when navigation ends
 */
export function useNavigation() {
  const [location, setLocation] = useLocation();

  // Function to handle navigation start
  const handleNavigationStart = useCallback(() => {
    document.documentElement.classList.add('navigating');
  }, []);

  // Function to handle navigation end
  const handleNavigationEnd = useCallback(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('navigating');
    }, 300); // Small delay for a better transition effect
  }, []);

  // Watch for location changes
  useEffect(() => {
    // When location changes, handle navigation end and scroll to top
    handleNavigationEnd();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return () => {
      // Clean up if component unmounts during navigation
      document.documentElement.classList.remove('navigating');
    };
  }, [location, handleNavigationEnd]);

  // Return both the location and the handleNavigationStart function
  // so components can trigger the start of navigation animations
  return { 
    location,
    handleNavigationStart 
  };
}