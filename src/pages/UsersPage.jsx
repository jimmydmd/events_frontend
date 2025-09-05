/**
 * Página de administración de usuarios del sistema de eventos
 * 
 * @component
 * @category Pages
 * @subcategory Administration
 * 
 * @description
 * Componente que permite la gestión completa de usuarios del sistema.
 * Solo accesible para usuarios con rol de administrador. Incluye
 * funcionalidades de listar, crear, editar y eliminar usuarios,
 * así como la asignación de roles.
 * 
 * @features
 * - Listado de usuarios con información detallada
 * - Creación de nuevos usuarios con formulario modal
 * - Edición de usuarios existentes
 * - Eliminación de usuarios con confirmación
 * - Gestión de roles de usuario
 * - Integración con API de FastAPI
 * - Manejo de errores y estados de carga
 * 
 * @requires
 * - AuthContext para validación de token de autenticación
 * - Usuario con rol de administrador
 * - Backend FastAPI con endpoints de usuarios y roles
 * 
 * @permissions
 * - Solo usuarios con rol 'Admin' pueden acceder a esta página
 * 
 * @example
 * // Se renderiza en la ruta '/users' para administradores
 * <UsersPage />
 * 
 * @see {@link AuthContext} Para información sobre autenticación
 * @see {@link EventsPage} Para la gestión de eventos
 */
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function UsersPage() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalError, setModalError] = useState("");

  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: ""
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
        setError("");
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        setError(err.response?.data?.detail || "Error cargando usuarios");
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/roles/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoles(res.data);
      } catch (err) {
        console.error("Error cargando roles:", err);
        // Obtener roles por defecto si la API falla
        setRoles([
          { id: "admin", name: "Admin" },
          { id: "organizer", name: "Organizer" },
          { id: "participant", name: "Participant" }
        ]);
      }
    };

    if (token) {
      fetchUsers();
      fetchRoles();
    }
  }, [token]);

  const handleCreateUser = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_id: ""
      });
      setModalError("");

      if (token) {
        setLoading(true);
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(res.data);
          setError("");
        } catch (err) {
          console.error("Error cargando usuarios:", err);
          setError(err.response?.data?.detail || "Error cargando usuarios");
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error creando usuario:", err);
      setModalError(err.response?.data?.detail || "Error creando usuario");
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUser(null);
      setModalError("");

      if (token) {
        setLoading(true);
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(res.data);
          setError("");
        } catch (err) {
          console.error("Error cargando usuarios:", err);
          setError(err.response?.data?.detail || "Error cargando usuarios");
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      setModalError(err.response?.data?.detail || "Error actualizando usuario");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (token) {
        setLoading(true);
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(res.data);
          setError("");
        } catch (err) {
          console.error("Error cargando usuarios:", err);
          setError(err.response?.data?.detail || "Error cargando usuarios");
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      setError(err.response?.data?.detail || "Error eliminando usuario");
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "Sin rol";
  };

  if (loading) return <div className="p-6">Cargando usuarios...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crear Usuario
        </button>
      </div>


      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (user.role?.name === 'Admin' || user.role_id === 'admin') 
                        ? 'bg-purple-100 text-purple-800'
                        : (user.role?.name === 'Organizer' || user.role_id === 'organizer')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role?.name || getRoleName(user.role_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* create user modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Usuario</h2>
            {modalError && <p className="text-red-500 text-sm mb-2">{modalError}</p>}
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  placeholder="Apellido"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setModalError("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            {modalError && <p className="text-red-500 text-sm mb-2">{modalError}</p>}
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingUser.first_name}
                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={editingUser.last_name}
                  onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={editingUser.role_id}
                  onChange={(e) => setEditingUser({ ...editingUser, role_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setModalError("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateUser(editingUser.id, {
                  first_name: editingUser.first_name,
                  last_name: editingUser.last_name,
                  email: editingUser.email,
                  role_id: editingUser.role_id
                })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:blue-600"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}