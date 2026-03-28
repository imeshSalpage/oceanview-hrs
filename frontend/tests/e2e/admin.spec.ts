import { expect, test } from "@playwright/test";

import { loginAs, logout } from "./helpers/auth";

test("admin can create and delete a user", async ({ page }) => {
  await loginAs(page, "admin", "Password@123");

  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();

  const stamp = Date.now();
  const username = `e2e_admin_${stamp}`;
  const inputs = page.locator("input");
  await inputs.nth(0).fill(username);
  await inputs.nth(1).fill(`${username}@example.com`);
  await inputs.nth(2).fill("Password@123");
  await page.getByRole("button", { name: "Create user" }).click();

  const row = page.locator("tr", { hasText: username });
  await expect(row).toBeVisible();

  // Click the initial delete button in the table row
  await row.getByRole("button", { name: "Delete" }).click();

  // Wait for the confirmation modal and click "Yes, delete"
  const modal = page.locator("div.fixed.inset-0", { hasText: "Confirm user deletion" });
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Yes, delete" }).click();

  // Wait for the modal to close and the row to be gone
  await expect(modal).not.toBeVisible({ timeout: 10000 });
  await expect(row).toHaveCount(0, { timeout: 10000 });

  await logout(page);
});
