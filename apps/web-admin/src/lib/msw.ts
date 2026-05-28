import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("*/auth/login", async ({ request }) => {
    const { email } = (await request.json()) as any;
    return HttpResponse.json({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "usr_1",
        name: "Admin User",
        email,
        role: "admin",
        tenantId: "ten_1",
      },
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
