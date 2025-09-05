/**
 * Página de registro de nuevos usuarios en el sistema de eventos
 * 
 * @component
 * @category Pages
 * @subcategory Authentication
 * 
 * @description
 * Componente que renderiza el formulario de registro de usuarios.
 * Permite a los nuevos usuarios crear una cuenta con sus datos personales
 * y credenciales de acceso. Tras registro exitoso, redirige al login.
 * 
 * @features
 * - Formulario de registro con validación de campos
 * - Manejo de errores específicos por campo desde el backend
 * - Mensajes de éxito y retroalimentación visual
 * - Redirección automática tras registro exitoso
 * - Integración con contexto de autenticación
 * 
 * @requires
 * - AuthContext para gestión del proceso de registro
 * - React Router para navegación
 * 
 * @example
 * // Se renderiza en la ruta '/register'
 * <RegisterPage />
 * 
 * @see {@link AuthContext} Para información sobre el sistema de autenticación
 * @see {@link LoginPage} Para el componente de inicio de sesión
 */
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    try {
      await register(form); // enviar los campos que espera el backend
      setMessage("Registro exitoso, redirigiendo al login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // si el backend devuelve [{field, message}, ...]
      if (err.response?.data) {
        const fieldErrors = {};
        err.response.data.forEach((error) => {
          fieldErrors[error.field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setMessage("Error al registrar, intenta de nuevo");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>

        {message && <p className="text-green-500 mb-4">{message}</p>}

        <input
          type="text"
          name="first_name"
          placeholder="Nombre"
          value={form.first_name}
          onChange={handleChange}
          className="w-full mb-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.first_name && <p className="text-red-500 mb-2 text-sm">{errors.first_name}</p>}

        <input
          type="text"
          name="last_name"
          placeholder="Apellido"
          value={form.last_name}
          onChange={handleChange}
          className="w-full mb-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.last_name && <p className="text-red-500 mb-2 text-sm">{errors.last_name}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.email && <p className="text-red-500 mb-2 text-sm">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.password && <p className="text-red-500 mb-2 text-sm">{errors.password}</p>}

        <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 mt-4">
          Registrarse
        </button>
      </form>
    </div>
  );
}
