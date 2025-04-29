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
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

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
