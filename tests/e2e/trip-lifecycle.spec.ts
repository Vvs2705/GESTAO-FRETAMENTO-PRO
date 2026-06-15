import { test, expect } from "@playwright/test";

test.describe("Nova Viagem", () => {
  test.beforeEach(async ({ page }) => {
    // Realiza login antes de cada teste
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@fretamento.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/executive");
  });

  test("Renderiza o formulário real e valida data obrigatória", async ({ page }) => {
    // 1. Acessa a criação de viagem (formulário real ligado à API)
    await page.goto("/trips/new");

    // 2. O formulário real é exibido (campos de seleção + data/hora)
    await expect(page.getByText("Início (data/hora)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar viagem" })).toBeVisible();

    // 3. Tentar criar sem a data obrigatória dispara a validação client-side
    await page.getByRole("button", { name: "Criar viagem" }).click();
    await expect(page.locator("text=Informe a data/hora de início")).toBeVisible();
  });
});
