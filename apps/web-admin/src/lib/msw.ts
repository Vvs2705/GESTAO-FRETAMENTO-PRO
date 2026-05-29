import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";

const mockPermissions = [
  "permission.manage",
  "role.manage",
  "trip.create",
  "trip.read",
  "trip.update",
  "trip.delete",
  "vehicle.create",
  "vehicle.read",
  "vehicle.update",
  "vehicle.delete",
  "driver.create",
  "driver.read",
  "driver.update",
  "driver.delete",
  "client.create",
  "client.read",
  "client.update",
  "client.delete",
  "occurrence.create",
  "occurrence.read",
  "occurrence.update",
  "occurrence.delete",
  "occurrence.resolve",
  "fuel.create",
  "fuel.read",
  "fuel.update",
  "fuel.delete",
  "maintenance.create",
  "maintenance.read",
  "maintenance.update",
  "maintenance.delete",
  "document.create",
  "document.read",
  "document.update",
  "document.delete",
  "finance.read"
];

export const handlers = [
  http.post("*/auth/login", async ({ request }) => {
    const { email } = (await request.json()) as any;
    if (email && email.includes("invalido")) {
      return new HttpResponse(
        JSON.stringify({ message: "Verifique suas credenciais." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return HttpResponse.json({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "usr_1",
        name: "Admin User",
        email,
        roleName: "CEO",
        tenantId: "ten_1",
        permissions: mockPermissions,
      },
    });
  }),

  http.get("*/users/me", async () => {
    return HttpResponse.json({
      id: "usr_1",
      name: "Admin User",
      email: "admin@fretamento.com",
      roleName: "CEO",
      tenantId: "ten_1",
      permissions: mockPermissions,
    });
  }),

  http.post("*/auth/refresh", async () => {
    return HttpResponse.json({
      accessToken: "mock-access-token-new",
      refreshToken: "mock-refresh-token-new",
    });
  }),

  http.post("*/auth/logout", async () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

export const worker = typeof window !== "undefined" ? setupWorker(...handlers) : null;

export async function initMsw() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (worker) {
      await worker.start({
        onUnhandledRequest: "bypass",
      });
      console.log("[MSW] Mocks da API inicializados.");
    }
  }
}
