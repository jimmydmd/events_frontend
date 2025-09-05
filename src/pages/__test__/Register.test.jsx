import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../RegisterPage";
import { AuthContext } from "../../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("Register Page", () => {
  const mockRegister = jest.fn();

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ register: mockRegister }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza el formulario correctamente", () => {
    renderComponent();

    expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Apellido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByText("Registrarse")).toBeInTheDocument();
  });

  test("registro exitoso muestra mensaje y redirige", async () => {
    mockRegister.mockResolvedValueOnce();

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Nombre"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), { target: { value: "password123" } });

    fireEvent.click(screen.getByText("Registrarse"));

    await waitFor(() => expect(screen.getByText(/Registro exitoso/i)).toBeInTheDocument());
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith("/login"));
  });

  test("muestra errores del backend en los campos", async () => {
    mockRegister.mockRejectedValueOnce({
      response: {
        data: [
          { field: "first_name", message: "Nombre requerido" },
          { field: "email", message: "Email inválido" },
        ],
      },
    });

    renderComponent();

    fireEvent.click(screen.getByText("Registrarse"));

    await waitFor(() => expect(screen.getByText("Nombre requerido")).toBeInTheDocument());
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
  });

  test("muestra mensaje genérico si backend falla sin detalles", async () => {
    mockRegister.mockRejectedValueOnce({});

    renderComponent();

    fireEvent.click(screen.getByText("Registrarse"));

    await waitFor(() => expect(screen.getByText("Error al registrar, intenta de nuevo")).toBeInTheDocument());
  });
});
