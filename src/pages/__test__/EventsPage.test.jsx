import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventsPage from "../EventsPage";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe("EventsPage", () => {
  const mockLogout = jest.fn();
  const mockUser = { email: "test@test.com", role: "Participant" };
  const token = "fake-token";

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ token, logout: mockLogout, user: mockUser }}>
        <EventsPage />
      </AuthContext.Provider>
    );

  const renderWithUser = (user) => {
    return render(
      <AuthContext.Provider value={{ user, token: "fake-token", logout: jest.fn() }}>
        <EventsPage />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra mensaje si no hay token", () => {
    render(
      <AuthContext.Provider value={{ token: null, logout: mockLogout, user: mockUser }}>
        <EventsPage />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/No estás autenticado/i)).toBeInTheDocument();
  });

  test("muestra loader mientras carga eventos", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    renderComponent();
    expect(screen.getByText(/Cargando eventos/i)).toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  test("muestra eventos devueltos por API", async () => {
    const events = [
      { id: 1, name: "Evento 1", description: "Desc 1", start_date: "2025-09-01T10:00", end_date: "2025-09-01T12:00", capacity: 100, status: "published", sessions: [] }
    ];
    axios.get.mockResolvedValueOnce({ data: events });
    renderComponent();

    expect(await screen.findByText(/Evento 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Desc 1/i)).toBeInTheDocument();
  });

  test("buscador actualiza el estado y llama fetchEvents", async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderComponent();

    const input = await screen.findByPlaceholderText(/Buscar evento/i);
    fireEvent.change(input, { target: { value: "Test Event" } });

    expect(input.value).toBe("Test Event");
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/events/"),
      expect.objectContaining({ params: expect.objectContaining({ term: "Test Event" }) })
    ));
  });

  test("logout llama al método logout", async () => {
    renderComponent();
    const logoutBtn = await screen.findByText(/Logout/i);
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  test("muestra botón de registrar si user es Participant y evento publicado", async () => {
      const mockUser = { role: "Participant" };

      const events = [
        {
          id: 1,
          name: "Evento 1",
          description: "",
          start_date: "2025-09-01T10:00",
          end_date: "2025-09-01T12:00",
          capacity: 50,
          status: "published",
          sessions: [{}]
        }
      ];

    axios.get.mockResolvedValueOnce({ data: events });

    renderWithUser(mockUser);

    // Espera explicacitamente el evento del boton
    await waitFor(() => {
      expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
    });
  });
});
