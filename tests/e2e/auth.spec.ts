import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação Mínima', () => {
  test('Deve realizar login com sucesso na central mock', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fretamento.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
});
