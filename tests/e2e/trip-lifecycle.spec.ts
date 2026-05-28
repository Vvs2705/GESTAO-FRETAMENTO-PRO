import { test, expect } from '@playwright/test';

test.describe('Ciclo de Vida de Viagem', () => {
  test('Deve avançar no wizard de 8 etapas de criação', async ({ page }) => {
    await page.goto('/trips/new');
    await page.selectOption('select', 'dell');
    await page.click('button:has-text("Avançar")');
    await expect(page.locator('text=PASSO 2 DE 8')).toBeVisible();
  });
});
