import { expect, test } from "@playwright/test";

import { loginAs, logout } from "./helpers/auth";

test("customer new reservation goes to rooms", async ({ page }) => {
  await loginAs(page, "customer", "Password@123");

  await page.goto("/my-reservations");
  await expect(page.getByRole("heading", { name: "Your Stays" })).toBeVisible();

  await page.getByRole("link", { name: "New reservation" }).click();
  await expect(page).toHaveURL(/\/rooms/);
  await expect(page.getByText("Coastal stays for every traveller")).toBeVisible();

  await logout(page);
});
