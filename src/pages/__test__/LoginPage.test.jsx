import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import Login from "../LoginPage";
import { AuthContext } from "../../context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const mockLogin = jest.fn();

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderComponent = () => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza el formulario de login", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("permite ingresar email y password", () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });
    expect(screen.getByPlaceholderText("Email")).toHaveValue("test@example.com");
    expect(screen.getByPlaceholderText("Password")).toHaveValue("123456");
  });

  test("realiza login correctamente y navega", async () => {
    mockLogin.mockResolvedValueOnce(); // login exitoso

    renderComponent();
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "123456");
      expect(mockNavigate).toHaveBeenCalledWith("/events");
    });
  });

  test("muestra error si login falla", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Fallo login"));

    renderComponent();
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Usuario o contraseña incorrecta")).toBeInTheDocument();
    });
  });
});
