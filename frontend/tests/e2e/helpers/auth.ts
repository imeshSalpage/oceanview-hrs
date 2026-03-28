import { expect, type Page } from "@playwright/test";

export async function loginAs(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  // Wait for the URL to change to either /my-reservations or /dashboard
  // Using a longer timeout if needed as the backend might be slow
  await page.waitForURL(/\/(my-reservations|dashboard)/, { timeout: 10000 });
}

export async function logout(page: Page) {
  const logoutBtn = page.getByRole("button", { name: "Log out" });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/$/);
  }
}

export function futureDate(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}
