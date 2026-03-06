import { expect, test } from "@playwright/test";

import { logout } from "./helpers/auth";

test("guest can browse public pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Your perfect coastal escape", { exact: false })).toBeVisible();

  await page.goto("/rooms");
  await expect(page.getByRole("heading", { name: "Coastal stays for every traveller" })).toBeVisible();

  await page.goto("/experiences");
  await expect(page.getByText("Resort Experiences")).toBeVisible();

  await page.goto("/contact");
  await expect(page.getByText("Contact us")).toBeVisible();

  await page.goto("/help");
  await expect(page.getByText("Help Center")).toBeVisible();
});

test("guest can register a new customer account", async ({ page }) => {
  const stamp = Date.now();
  const username = `e2e_guest_${stamp}`;

  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(`${username}@example.com`);
  await page.getByLabel("Password").fill("Password@123");

  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/my-reservations/);
  await expect(page.getByRole("heading", { name: "Your Stays" })).toBeVisible();

  await logout(page);
});
