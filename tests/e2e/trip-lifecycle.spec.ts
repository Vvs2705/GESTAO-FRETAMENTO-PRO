import { test, expect } from "@playwright/test";

test.describe("Ciclo de Vida de Viagem", () => {
  test.beforeEach(async ({ page }) => {
    // Realiza login antes de cada teste
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@fretamento.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/executive");
  });

  test("Deve avançar e concluir o wizard de 8 etapas de criação de viagem", async ({ page }) => {
    // 1. Acessa a página de criação de viagem
    await page.goto("/trips/new");

    // 2. Passo 1: Selecionar o cliente (Campo Obrigatório)
    await expect(page.locator("text=PASSO 1 DE 8")).toBeVisible();
    
    // Tenta avançar sem preencher para testar a validação
    await page.click('button:has-text("Avançar")');
    await expect(page.locator("text=Selecione o cliente.")).toBeVisible();

    // Preenche o cliente
    await page.locator(".max-w-xl select").selectOption("dell");
    await page.click('button:has-text("Avançar")');

    // 3. Passo 2: Digitar a Rota (Campo Obrigatório)
    await expect(page.locator("text=PASSO 2 DE 8")).toBeVisible();
    await page.click('button:has-text("Avançar")');
    await expect(page.locator("text=Defina a rota.")).toBeVisible();

    // Preenche a rota
    await page.locator('input[placeholder*="EX: São Paulo"]').fill("SP para Campinas");
    await page.click('button:has-text("Avançar")');

    // 4. Passos 3 a 8
    for (let s = 3; s <= 7; s++) {
      await expect(page.locator(`text=PASSO ${s} DE 8`)).toBeVisible();
      await page.click('button:has-text("Avançar")');
    }

    // 5. Passo 8: Conclusão
    await expect(page.locator("text=PASSO 8 DE 8")).toBeVisible();
    await page.click('button:has-text("Concluir")');

    // 6. Deve exibir o toast de sucesso e redirecionar para a lista de viagens
    await expect(page).toHaveURL("/trips");
    await expect(page.locator("text=Viagem criada com sucesso")).toBeVisible();
  });
});
