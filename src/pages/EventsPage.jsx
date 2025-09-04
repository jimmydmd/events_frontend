// src/pages/EventsPage.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function EventsPage() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [limit] = useState(10); // límite de items por página
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/events/", {
          headers: { Authorization: `Bearer ${token}` },
          params: { term, limit, offset },
        });
        setEvents(res.data);
      } catch (err) {
        console.error(err.response?.data || err);
        setError("Error cargando eventos");
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token, term, limit, offset, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    setTerm(e.target.value);
    setOffset(0); // resetear paginación al cambiar término
  };

  const handleNextPage = () => setOffset(offset + limit);
  const handlePrevPage = () => setOffset(Math.max(0, offset - limit));

  if (!token) return <p className="text-center mt-10">No estás autenticado</p>;
  if (loading) return <p className="text-center mt-10">Cargando eventos...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Eventos Disponibles</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Buscar evento..."
          value={term}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 && (
          <p className="col-span-full text-center text-gray-500">No hay eventos</p>
        )}
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
          >
            <h2 className="text-xl font-bold mb-2">{ev.name}</h2>
            <p className="text-gray-700 mb-2">{ev.description || "Sin descripción"}</p>
            <p className="text-sm text-gray-500">
              {new Date(ev.start_date).toLocaleString()} -{" "}
              {new Date(ev.end_date).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">Capacidad: {ev.capacity}</p>

            {/* Sección de sesiones */}
            {ev.sessions && ev.sessions.length > 0 && (
              <div className="mt-4 border-t pt-2">
                <h3 className="font-semibold mb-2">Sesiones:</h3>
                {ev.sessions.map((sess) => (
                  <div key={sess.id} className="mb-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium">{sess.title}</p>
                    <p className="text-xs text-gray-500">{sess.speaker}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(sess.start_time).toLocaleString()} -{" "}
                      {new Date(sess.end_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={offset === 0}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
