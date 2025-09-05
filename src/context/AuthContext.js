import { createContext, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  });

  // Decode token to get user information
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded.sub || decoded.user_id,
        email: decoded.email,
        role: decoded.role || "Participant", // Ajusta según los claims de tu token
        first_name: decoded.first_name || decoded.given_name || "",
        last_name: decoded.last_name || decoded.family_name || ""
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/login", { email, password });
      const newToken = res.data.access_token;
      
      const userData = getUserFromToken(newToken);
      
      if (!userData) {
        throw new Error("Error al procesar la información del usuario");
      }
      
      // Store token and user data in localStorage
      localStorage.setItem("access_token", newToken);
      localStorage.setItem("user_data", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      throw new Error(err.response?.data?.detail || "Usuario o contraseña incorrecta");
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/register", userData);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};