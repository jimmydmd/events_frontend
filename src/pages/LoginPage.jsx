/**
 * Página de inicio de sesión del sistema de eventos
 * 
 * @component
 * @category Pages
 * @subcategory Authentication
 * 
 * @description
 * Componente que renderiza el formulario de autenticación de usuarios.
 * Permite a los usuarios ingresar con email y contraseña, redirigiendo
 * a la página de eventos upon successful authentication.
 * 
 * @features
 * - Formulario de login con validación de campos
 * - Manejo de errores de autenticación
 * - Redirección automática tras login exitoso
 * - Enlace a página de registro
 * - Integración con contexto de autenticación
 * 
 * @requires
 * - AuthContext para gestión de estado de autenticación
 * - React Router para navegación
 * 
 * @example
 * // Se renderiza en la ruta '/login'
 * <LoginPage />
 * 
 * @see {@link AuthContext} Para información sobre el sistema de autenticación
 * @see {@link RegisterPage} Para el componente de registro
 * @see {@link http://localhost:8000/docs/} Documentación de FastAPI para el proyecto backend
 */
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/events"); // redirect to events page on success
    } catch (err) {
      setError("Usuario o contraseña incorrecta");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Login
        </button>

        <p className="mt-4 text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Regístrate
          </span>
        </p>
      </form>
    </div>
  );
}
