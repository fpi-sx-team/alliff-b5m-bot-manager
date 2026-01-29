import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface KeyData {
  id: number;
  keyCode: string;
  isAdmin: boolean;
  maxBots: number;
  expiryDate: string;
}

interface KeyAuthContextType {
  keyData: KeyData | null;
  setKeyData: (data: KeyData | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const KeyAuthContext = createContext<KeyAuthContextType | undefined>(undefined);

export function KeyAuthProvider({ children }: { children: ReactNode }) {
  const [keyData, setKeyDataState] = useState<KeyData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (stored) {
      try {
        setKeyDataState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("keyData");
      }
    }
  }, []);

  const setKeyData = (data: KeyData | null) => {
    if (data) {
      localStorage.setItem("keyData", JSON.stringify(data));
    } else {
      localStorage.removeItem("keyData");
    }
    setKeyDataState(data);
  };

  const logout = () => {
    localStorage.removeItem("keyData");
    setKeyDataState(null);
    window.location.href = "/login";
  };

  return (
    <KeyAuthContext.Provider
      value={{
        keyData,
        setKeyData,
        logout,
        isAuthenticated: !!keyData,
      }}
    >
      {children}
    </KeyAuthContext.Provider>
  );
}

export function useKeyAuth() {
  const context = useContext(KeyAuthContext);
  if (!context) {
    throw new Error("useKeyAuth must be used within KeyAuthProvider");
  }
  return context;
}
