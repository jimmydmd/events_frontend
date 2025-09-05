/**
 * Configuración principal de enrutamiento de la aplicación de gestión de eventos
 * 
 * @component
 * @category Core
 * 
 * @description
 * Componente que define todas las rutas de la aplicación y maneja la navegación
 * condicional basada en el estado de autenticación del usuario.
 * 
 * @features
 * - Protección de rutas basada en autenticación
 * - Redirecciones automáticas según estado de login
 * - Manejo de rutas no encontradas (404)
 * - Integración con React Router v6
 * 
 * @requires
 * - React Router DOM para el enrutamiento
 * - AuthContext para verificación de autenticación
 * 
 * @routes
 * - `/` → Redirección automática (a login o eventos)
 * - `/login` → Página de inicio de sesión
 * - `/register` → Página de registro de usuarios
 * - `/events` → Página principal de eventos (protegida)
 * - `/users` → Página de administración de usuarios
 * - `/*` → Manejo de rutas no encontradas
 * 
 * @authentication
 * - Rutas públicas: `/login`, `/register`
 * - Rutas protegidas: `/events`, `/users`
 * - Redirección automática basada en presencia de token
 * 
 * @example
 * // Uso en el componente principal de la aplicación
 * function MainApp() {
 *   return (
 *     <AuthProvider>
 *       <App />
 *     </AuthProvider>
 *   );
 * }
*/
// App.js
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventsPage from "./pages/EventsPage";
import UsersPage from "./pages/UsersPage";

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/events" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/users" element={<UsersPage />} /> 
      <Route path="/events" element={token ? <EventsPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
