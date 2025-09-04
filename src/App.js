import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/auth/login/", {
        email,
        password,
      });

      const { access, refresh } = response.data;
      setMessage("¡Login exitoso!");
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
    } catch (error) {
      console.error(error);
      setMessage("Error: Usuario o contraseña incorrecta");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        {message && (
          <div className="mb-4 text-center text-red-500 font-semibold">{message}</div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Usuario</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
