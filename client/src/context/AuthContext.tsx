import { createContext, useContext, useState, ReactNode } from "react";
import { MockUser } from "../lib/firebase";

// Use our MockUser type instead of Firebase User
type AuthContextType = {
  user: MockUser | null;
  loading: boolean;
  setUser: (user: MockUser | null) => void;
  setLoading: (loading: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  setLoading: () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Using a mock user for demonstration
  const mockUser: MockUser = {
    uid: "demo-user-123",
    email: "demo@gamehub.com",
    displayName: "Demo Player",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamehub",
  };

  const [user, setUser] = useState<MockUser | null>(mockUser);
  const [loading, setLoading] = useState(false);

  const value = {
    user,
    loading,
    setUser,
    setLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
