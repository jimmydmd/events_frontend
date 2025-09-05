/**
 * Página principal de gestión de eventos del sistema
 * 
 * @component
 * @category Pages
 * 
 * @description
 * Componente que muestra una lista de eventos, permite buscar, filtrar,
 * crear, editar y eliminar eventos y sesiones. También gestiona registros
 * de usuarios a eventos según su rol.
 * 
 * @features
 * - Búsqueda de eventos con debounce
 * - Paginación de resultados
 * - CRUD completo de eventos (según permisos)
 * - Gestión de sesiones dentro de eventos
 * - Registro de participantes a eventos
 * - Vista de "Mis registros" para participantes
 * 
 * @requires
 * - Usuario autenticado con token válido
 * 
 * @param {Object} props - No recibe props directos, usa contexto de autenticación
 * 
 * @example
 * // Se renderiza automáticamente al navegar a la ruta correspondiente
 * <EventsPage />
 * 
 * @see {@link AuthContext} Para información sobre el contexto de autenticación
 * @see {@link http://localhost:8000/docs/} Documentación de FastAPI para el proyecto backend
 */
import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

// Debounce for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}


export default function EventsPage() {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [editingEvent, setEditingEvent] = useState(null);
  const [modalError, setModalError] = useState("");

  const [editingSession, setEditingSession] = useState(null);
  const [modalSessionError, setModalSessionError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    capacity: 0,
    start_date: "",
    end_date: "",
    status: "draft",
  });

  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [selectedEventForSession, setSelectedEventForSession] = useState(null);
  const [newSession, setNewSession] = useState({
    title: "",
    speaker: "",
    description: "",
    capacity: 0,
    start_time: "",
    end_time: "",
    event_id: "",
  });

  const [userRegistrations, setUserRegistrations] = useState([]);
  const [showMyRegistrations, setShowMyRegistrations] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Debounced search term
  const debouncedTerm = useDebounce(term, 500);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/events/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { term: debouncedTerm, limit, offset },
      });
      setEvents(res.data);
      setError("");
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
  }, [token, limit, offset, logout, navigate, debouncedTerm]);

  // Fetch user registrations
  const fetchUserRegistrations = useCallback(async () => {
    if (!token || !user) return;
    setRegistrationLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/registrations/my_registrations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserRegistrations(res.data);
    } catch (err) {
      console.error(err.response?.data || err);
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setRegistrationLoading(false);
    }
  }, [token, user, logout, navigate]);

  // Load events and registrations
  useEffect(() => {
    fetchEvents();
    if (user && user.role === "Participant") {
      fetchUserRegistrations();
    }
  }, [fetchEvents, fetchUserRegistrations, user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    setTerm(e.target.value);
    setOffset(0);
  };

  const handleNextPage = () => setOffset(offset + limit);
  const handlePrevPage = () => setOffset(Math.max(0, offset - limit));

  // Create event
  const handleCreateEvent = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/events/`,
        { ...newEvent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      setNewEvent({
        name: "",
        description: "",
        capacity: 0,
        start_date: "",
        end_date: "",
        status: "draft",
      });
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Error creando el evento");
    }
  };

  // update event
  const handleUpdateEvent = async (id, data) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/events/${id}`,
        { ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      setModalError(err.response?.data?.detail || "Error actualizando el evento");
    }
  };

  // cancel event
  const handleCancelEvent = async (id) => {
    if (!window.confirm("¿Cancelar este evento?")) return;
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/events/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.detail || "Error cancelando el evento");
    }
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm("¿Eliminar este evento?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.detail || "Error eliminando el evento");
    }
  };

  // Logout
  const handleCreateSession = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/events/sessions/`,
        { ...newSession, event_id: selectedEventForSession.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateSessionModal(false);
      setNewSession({
        title: "",
        speaker: "",
        description: "",
        capacity: 0,
        start_time: "",
        end_time: "",
        event_id: "",
      });
      setSelectedEventForSession(null);
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Error creando la sesión");
    }
  };

  // Delete session
  const handleDeleteSession = async (id) => {
    if (!window.confirm("¿Eliminar esta sesión?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/events/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.detail || "Error eliminando la sesión");
    }
  };

  // Uedate sesión
  const handleUpdateSession = async (id, data) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/events/sessions/${id}`,
        { ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingSession(null);
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      setModalSessionError(err.response?.data?.detail || "Error actualizando la sesión");
    }
  };

  // Register to event
  const handleRegisterToEvent = async (eventId) => {
    if (!window.confirm("¿Deseas registrarte a este evento?")) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/registrations/`,
        { event_id: eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("¡Registro exitoso!");
      fetchUserRegistrations();
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Error al registrarse al evento");
    }
  };

  const isUserRegistered = (eventId) => {
    return userRegistrations.some((reg) => reg.event_id === eventId);
  };

  // Open create session modal
  const openCreateSessionModal = (event) => {
    setSelectedEventForSession(event);
    setNewSession({
      title: "",
      speaker: "",
      description: "",
      capacity: 0,
      start_time: "",
      end_time: "",
      event_id: event.id,
    });
    setShowCreateSessionModal(true);
  };

  // Render action buttons
  const renderActionButtons = (event) => {
    if (!user) return null;

    if (user.role === "Admin" || user.role === "Organizer") {
      return (
        <>
          <button
            onClick={() => setEditingEvent(event)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Editar
          </button>
          <button
            onClick={() => openCreateSessionModal(event)}
            className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm"
          >
            + Sesión
          </button>
          <button
            onClick={() => handleCancelEvent(event.id)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
          >
            Cancelar
          </button>
          {user.role === "Admin" && (
            <button
              onClick={() => handleDeleteEvent(event.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Eliminar
            </button>
          )}
        </>
      );
    }

    if (user.role === "Participant" && event.status === "published") {
      const registered = isUserRegistered(event.id);
      return (
        <button
          onClick={() => handleRegisterToEvent(event.id)}
          disabled={registered}
          className={`px-3 py-1 rounded text-sm ${
            registered
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {registered ? "Registrado" : "Registrarse"}
        </button>
      );
    }

    return null;
  };

  if (!token) return <p className="text-center mt-10">No estás autenticado</p>;
  if (loading) return <p className="text-center mt-10">Cargando eventos...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Eventos Disponibles</h1>
        <div className="flex space-x-2">
          {user && user.role === "Participant" && (
            <button
              onClick={() => setShowMyRegistrations(!showMyRegistrations)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              {showMyRegistrations ? "Ver Todos" : "Mis Registros"}
            </button>
          )}
          {user && (user.role === "Admin" || user.role === "Organizer") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Crear Evento
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
          {user && user.role === "Admin" && (
            <Link
              to="/users"
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Gestionar Usuarios
            </Link>
          )}
        </div>
      </div>

      {/* Debug info */}
      {user && (
        <div className="mb-4 p-2 bg-blue-100 rounded">
          <p className="text-sm">Usuario: {user.email} | Rol: {user.role}</p>
        </div>
      )}

      {/* SearchBar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Buscar evento..."
          value={term}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Resgistrations */}
      {showMyRegistrations && user?.role === "Participant" ? (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Mis Registros</h2>
          {registrationLoading ? (
            <p className="text-center">Cargando registros...</p>
          ) : userRegistrations.length === 0 ? (
            <p className="text-center text-gray-500">No tienes registros activos</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRegistrations.map((registration) => (
                <div key={registration.event_id} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-2">{registration.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(registration.start_date).toLocaleString()} -{" "}
                    {new Date(registration.end_date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Capacidad: {registration.capacity}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Registrado el: {new Date(registration.registered_at).toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Registrado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (

        // View all events
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No hay eventos</p>
            ) : (
              events.map((ev) => (
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
                  <p className="text-sm text-gray-600 mt-1">Estado: {ev.status}</p>

                  {/* Buttons */}
                  <div className="mt-4 flex space-x-2 flex-wrap gap-2">
                    {renderActionButtons(ev)}
                  </div>

                  {/* Sessions */}
                  {ev.sessions && ev.sessions.length > 0 && (
                    <div className="mt-4 border-t pt-2">
                      <h3 className="font-semibold mb-2">Sesiones:</h3>
                      {ev.sessions.map((sess) => (
                        <div key={sess.id} className="mb-2 p-2 bg-gray-50 rounded flex justify-between items-center">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{sess.title}</p>
                            <p className="text-xs text-gray-500">{sess.speaker}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(sess.start_time).toLocaleString()} -{" "}
                              {new Date(sess.end_time).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">Capacidad: {sess.capacity || 0}</p>
                          </div>
                          {user && (user.role === "Admin" || user.role === "Organizer") && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setEditingSession(sess)}
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteSession(sess.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevPage}
              disabled={offset === 0}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={events.length < limit}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Create event modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Evento</h2>
            <input
              type="text"
              placeholder="Nombre"
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={newEvent.capacity}
              onChange={(e) =>
                setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Descripción"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fecha inicio:</label>
            <input
              type="datetime-local"
              value={newEvent.start_date}
              onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fecha fin:</label>
            <input
              type="datetime-local"
              value={newEvent.end_date}
              onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create session modal */}
      {showCreateSessionModal && selectedEventForSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Crear Sesión para: {selectedEventForSession.name}
            </h2>
            <input
              type="text"
              placeholder="Título de la sesión"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Speaker"
              value={newSession.speaker}
              onChange={(e) => setNewSession({ ...newSession, speaker: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={newSession.capacity}
              onChange={(e) =>
                setNewSession({ ...newSession, capacity: parseInt(e.target.value) || 0 })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Descripción"
              value={newSession.description}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fecha y hora de inicio:</label>
            <input
              type="datetime-local"
              value={newSession.start_time}
              onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fecha y hora de fin:</label>
            <input
              type="datetime-local"
              value={newSession.end_time}
              onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowCreateSessionModal(false);
                  setSelectedEventForSession(null);
                }}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSession}
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Crear Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit event modal */}
      {editingEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Evento</h2>
            {modalError && <p className="text-red-500 text-sm mb-2">{modalError}</p>}
            <input
              type="text"
              value={editingEvent.name}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, name: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="number"
              value={editingEvent.capacity}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, capacity: parseInt(e.target.value) })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <textarea
              value={editingEvent.description || ""}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, description: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fecha inicio:</label>
            <input
              type="datetime-local"
              value={editingEvent.start_date.slice(0, 16)}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, start_date: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fecha fin:</label>
            <input
              type="datetime-local"
              value={editingEvent.end_date.slice(0, 16)}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, end_date: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Estado:</label>
            <select
              value={editingEvent.status}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, status: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingEvent(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleUpdateEvent(editingEvent.id, {
                    name: editingEvent.name,
                    description: editingEvent.description,
                    capacity: editingEvent.capacity,
                    start_date: editingEvent.start_date,
                    end_date: editingEvent.end_date,
                    status: editingEvent.status,
                  })
                }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit session modal */}
      {editingSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Sesión</h2>
            {modalSessionError && (
              <p className="text-red-500 text-sm mb-2">{modalSessionError}</p>
            )}
            <input
              type="text"
              placeholder="Título"
              value={editingSession.title}
              onChange={(e) =>
                setEditingSession({ ...editingSession, title: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Speaker"
              value={editingSession.speaker}
              onChange={(e) =>
                setEditingSession({ ...editingSession, speaker: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Capacidad"
              value={editingSession.capacity || 0}
              onChange={(e) =>
                setEditingSession({ ...editingSession, capacity: parseInt(e.target.value) || 0 })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Descripción"
              value={editingSession.description || ""}
              onChange={(e) =>
                setEditingSession({ ...editingSession, description: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Inicio:</label>
            <input
              type="datetime-local"
              value={editingSession.start_time?.slice(0, 16) || ""}
              onChange={(e) =>
                setEditingSession({ ...editingSession, start_time: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <label className="text-sm text-gray-500">Fin:</label>
            <input
              type="datetime-local"
              value={editingSession.end_time?.slice(0, 16) || ""}
              onChange={(e) =>
                setEditingSession({ ...editingSession, end_time: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingSession(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleUpdateSession(editingSession.id, {
                    title: editingSession.title,
                    speaker: editingSession.speaker,
                    description: editingSession.description,
                    start_time: editingSession.start_time,
                    end_time: editingSession.end_time,
                    event_id: editingSession.event_id,
                    capacity: editingSession.capacity || 0
                  })
                }
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  
  