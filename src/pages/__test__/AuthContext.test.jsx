import { render, screen } from "@testing-library/react";
import { AuthContext, AuthProvider } from "../../context/AuthContext";
import axios from "axios";

jest.mock("axios");

describe("AuthContext", () => {
  const mockUserToken = "mock.jwt.token";
  const mockDecodedUser = {
    sub: "123",
    email: "test@example.com",
    role: "Admin",
    first_name: "John",
    last_name: "Doe",
  };

  jest.mock("jwt-decode", () => ({
    jwtDecode: jest.fn(() => mockDecodedUser)
  }));
  const { jwtDecode } = require("jwt-decode");

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("proporciona valores iniciales correctos", () => {
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => (
            <>
              <span data-testid="token">{value.token}</span>
              <span data-testid="user">{value.user ? value.user.email : "null"}</span>
            </>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(screen.getByTestId("token").textContent).toBe("");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  test("login exitoso guarda token y user", async () => {
    axios.post.mockResolvedValueOnce({ data: { access_token: mockUserToken } });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    const userData = await contextValue.login("test@example.com", "password");

    expect(jwtDecode).toHaveBeenCalledWith(mockUserToken);
    expect(userData.email).toBe(mockDecodedUser.email);
    expect(localStorage.getItem("access_token")).toBe(mockUserToken);
    expect(localStorage.getItem("user_data")).toBe(JSON.stringify(userData));
    expect(contextValue.user.email).toBe(mockDecodedUser.email);
  });

  test("login con error lanza mensaje correcto", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { detail: "Invalid credentials" } } });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await expect(contextValue.login("test@example.com", "wrong")).rejects.toThrow("Invalid credentials");
  });

  test("logout limpia token y user", () => {
    localStorage.setItem("access_token", "token");
    localStorage.setItem("user_data", JSON.stringify({ email: "test@example.com" }));

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    contextValue.logout();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("user_data")).toBeNull();
    expect(contextValue.token).toBe("");
    expect(contextValue.user).toBeNull();
  });

  test("register llama al endpoint y retorna data", async () => {
    const mockResponse = { id: 1, email: "new@example.com" };
    axios.post.mockResolvedValueOnce({ data: mockResponse });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    const response = await contextValue.register({ email: "new@example.com", password: "123" });

    expect(response).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_BASE_URL}/auth/register`,
      { email: "new@example.com", password: "123" }
    );
  });
});
