import { test, expect } from "@playwright/test";

test.describe("Fluxos de Autenticação", () => {
  test("Deve realizar login com sucesso e depois logout", async ({ page }) => {
    // 1. Acessa a tela de login
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Gestão Fretamento Pro");

    // 2. Preenche e-mail e envia
    await page.fill('input[type="email"]', "admin@fretamento.com");
    await page.click('button[type="submit"]');

    // 3. Deve redirecionar para a home (/executive)
    await expect(page).toHaveURL("/executive");

    // 4. Clica no menu do usuário na TopBar
    await page.click('[data-testid="user-menu-button"]');

    // 5. Clica no botão Sair / Logout
    await page.click('[data-testid="logout-button"]');

    // 6. Deve retornar para /login
    await expect(page).toHaveURL("/login");
  });

  test("Deve exibir erro para credenciais inválidas", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "invalido@fretamento.com");
    await page.click('button[type="submit"]');

    // Deve permanecer na página de login e exibir toast de erro
    await expect(page).toHaveURL("/login");
    await expect(page.locator("text=Verifique suas credenciais")).toBeVisible();
  });

  test("Deve redirecionar para login quando não autenticado", async ({ page }) => {
    await page.goto("/executive");
    await expect(page).toHaveURL("/login");
  });
});
