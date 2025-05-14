import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";

interface ProfileCompletenessResult {
  isProfileComplete: boolean;
  missingFields: string[];
  showCompletionModal: boolean;
  setShowCompletionModal: (show: boolean) => void;
}

export function useProfileCompleteness(): ProfileCompletenessResult {
  const { user } = useAuth();
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true);

  // Check if the user profile is complete
  useEffect(() => {
    if (!user) {
      setIsProfileComplete(false);
      setMissingFields(["login"]);
      return;
    }

    const requiredFields = checkRequiredFields(user);
    setMissingFields(requiredFields);
    setIsProfileComplete(requiredFields.length === 0);
  }, [user]);

  return {
    isProfileComplete,
    missingFields,
    showCompletionModal,
    setShowCompletionModal
  };
}

// Helper function to check which required fields are missing
function checkRequiredFields(user: User): string[] {
  const missing: string[] = [];

  // Check required fields based on community norms
  if (!user.displayName) missing.push("displayName");
  
  // In a real implementation, these fields would need to be added to the User schema
  // For demonstration, we'll check if they might exist in other fields or use placeholders
  
  // Check for pronouns (we'd need to add this field to the schema)
  const hasPronounsInBio = user.bio?.toLowerCase().includes("pronouns");
  if (!hasPronounsInBio) missing.push("pronouns");
  
  // Check for timezone (we'd need to add this field to the schema)
  const hasTimezoneInLocation = user.location?.match(/[A-Z]{2,4}T|GMT|UTC|EST|PST|CST|MST|CET/i);
  if (!hasTimezoneInLocation) missing.push("timeZone");
  
  // Check for game preferences
  if (!user.favoriteGames) missing.push("favoriteGames");
  
  return missing;
}