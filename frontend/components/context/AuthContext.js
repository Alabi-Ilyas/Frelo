import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../../api/apiCalls"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- HYDRATION (Startup Logic) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const storedUser = await AsyncStorage.getItem("user");

        if (token && storedUser) {
          // Set Axios headers so future calls work immediately
          setAuthToken(token); 
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to hydrate auth state:", e);
      } finally {
        // Always stop loading, even if no token is found
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // --- LOGIN LOGIC ---
  const login = async (userData, token, refreshToken) => {
    try {
      // 1. Persist to Disk
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("access_token", token);
      await AsyncStorage.setItem("refresh_token", refreshToken);

      // 2. Update Global Axios Headers
      setAuthToken(token);

      // 3. Update Memory State (Triggers App.js re-render)
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Failed to save login session:", e);
      throw e; // Rethrow so the UI can catch it if needed
    }
  };

  // --- LOGOUT LOGIC ---
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "access_token", "refresh_token"]);
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Failed to logout:", e);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};