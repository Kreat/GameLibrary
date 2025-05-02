import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to handle smooth page transitions
 * Adds a "navigating" class to html when navigation starts and removes it when navigation ends
 */
export function useNavigation() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Function to handle navigation start
    const handleNavigationStart = () => {
      document.documentElement.classList.add('navigating');
    };

    // Function to handle navigation end
    const handleNavigationEnd = () => {
      setTimeout(() => {
        document.documentElement.classList.remove('navigating');
      }, 150); // Small delay for a better transition effect
    };

    // The original navigate function from wouter
    const originalNavigate = setLocation;

    // Override the navigate function to add our transition handling
    const enhancedNavigate = (to: string) => {
      if (to !== location) {
        handleNavigationStart();
        originalNavigate(to);
        handleNavigationEnd();
      }
    };

    return () => {
      // Cleanup
      document.documentElement.classList.remove('navigating');
    };
  }, [location, setLocation]);

  return { location };
}