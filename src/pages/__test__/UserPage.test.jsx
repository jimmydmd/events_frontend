// src/pages/__test__/UsersPage.test.jsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UsersPage from "../UsersPage";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

jest.mock("axios");

describe("UsersPage", () => {
  const mockToken = "test-token";

  const renderWithAuth = (ui) => {
    return render(
      <AuthContext.Provider value={{ token: mockToken }}>
        {ui}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra 'Cargando usuarios...' inicialmente", () => {
    renderWithAuth(<UsersPage />);
    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();
  });

  test("carga usuarios y roles correctamente", async () => {
    const usersData = [
      { id: 1, first_name: "Juan", last_name: "Perez", email: "juan@example.com", role_id: "admin", role: { name: "Admin" } },
      { id: 2, first_name: "Ana", last_name: "Lopez", email: "ana@example.com", role_id: "organizer", role: { name: "Organizer" } }
    ];

    const rolesData = [
      { id: "admin", name: "Admin" },
      { id: "organizer", name: "Organizer" }
    ];

    axios.get.mockImplementation((url) => {
      if (url.endsWith("/users/")) return Promise.resolve({ data: usersData });
      if (url.endsWith("/roles/")) return Promise.resolve({ data: rolesData });
    });

    renderWithAuth(<UsersPage />);

    // Carga de tabla
    await waitFor(() => {
      expect(screen.getByText("Juan Perez")).toBeInTheDocument();
      expect(screen.getByText("Ana Lopez")).toBeInTheDocument();
    });

    // Verificacion de ß roles
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Organizer")).toBeInTheDocument();
  });

  test("maneja error al cargar usuarios", async () => {
    axios.get.mockRejectedValue({ response: { data: { detail: "Error API" } } });

    renderWithAuth(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Error API")).toBeInTheDocument();
    });
  });

  test("abre modal de creación de usuario al hacer click", async () => {
    axios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] });

    renderWithAuth(<UsersPage />);

    const createButton = screen.getByText(/Crear Usuario/i);
    fireEvent.click(createButton);

    expect(screen.getByText(/Crear Usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Apellido/i)).toBeInTheDocument();
  });
});
