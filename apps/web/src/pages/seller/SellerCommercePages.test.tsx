import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SellerSettingsPage } from "./SellerCommercePages";
import { demoSession } from "@/lib/auth/demo";
import { setSession } from "@/lib/auth/store";
import { resetDemoData } from "@/mocks/store";
import { sellers } from "@/mocks/fixtures";

beforeEach(() => {
  localStorage.clear();
  resetDemoData();
  setSession(demoSession("seller"));
});
afterEach(() => {
  cleanup();
  setSession(null);
});
describe("shop settings form", () => {
  it("saves the seller profile and workplace into shared records", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <SellerSettingsPage />
      </QueryClientProvider>,
    );
    await screen.findByLabelText("Shop name");
    for (const [label, value] of [
      ["Shop name", "New shop name"],
      ["Contact name", "Demo seller"],
      ["Contact email", "updated@example.com"],
      ["Workplace address", "12 Market Street"],
      ["City", "London"],
      ["Country", "United Kingdom"],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Save shop settings" }));
    await waitFor(() => expect(sellers[0].shopName).toBe("New shop name"));
    expect(sellers[0].workplaceAddress?.line1).toBe("12 Market Street");
    expect(sellers[0].email).toBe("updated@example.com");
    client.clear();
  });
});
