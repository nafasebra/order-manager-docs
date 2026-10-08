import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { LoginPage } from "./LoginPage";
import { getSession, setSession } from "@/lib/auth/store";

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(async () => undefined),
}));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
afterEach(() => {
  cleanup();
  setSession(null);
  navigate.mockClear();
});
describe("login form", () => {
  it("signs a buyer into the correct mock identity", async () => {
    render(<LoginPage defaultPanel="buyer" />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(getSession()?.buyerId).toBe("buyer-0001"));
    expect(navigate).toHaveBeenCalledWith({ to: "/account" });
  });
  it("prefills support credentials and opens the support landing page", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Demo staff account"), {
      target: { value: "support" },
    });
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "support@example.com",
    );
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(getSession()?.id).toBe("adm-2"));
    expect(navigate).toHaveBeenCalledWith({ to: "/admin/support/tickets" });
  });
  it("toggles password visibility without submitting", () => {
    render(<LoginPage />);
    const password = screen.getByLabelText("Password") as HTMLInputElement;
    expect(password.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password.type).toBe("text");
    expect(navigate).not.toHaveBeenCalled();
  });
});
