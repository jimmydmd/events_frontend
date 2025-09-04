import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/login", { email, password });
      const newToken = res.data.access_token; // token de FastAPI
      localStorage.setItem("access_token", newToken);
      setToken(newToken);
    } catch (err) {
      throw new Error("Usuario o contraseña incorrecta");
    }
  };

    // Registro
    const register = async (userData) => {
    // userData debe tener first_name, last_name, email, password
    try {
      const res = await axios.post("http://localhost:8000/auth/register", userData);
      return res.data;
    } catch (err) {
      // lanzar error para manejarlo en el componente
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
