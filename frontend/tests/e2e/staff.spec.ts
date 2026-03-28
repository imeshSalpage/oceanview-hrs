import { expect, test } from "@playwright/test";

import { futureDate, loginAs, logout } from "./helpers/auth";

test("reception can access staff pages and create reservation", async ({ page }) => {
  await loginAs(page, "reception", "Password@123");
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/reservations");
  await expect(page.getByRole("heading", { name: "Reservations", exact: true })).toBeVisible();

  const stamp = Date.now();
  const guestName = `E2E Staff ${stamp}`;
  const createSection = page.locator("div.ocean-surface", {
    has: page.getByText("Create reservation", { exact: true }),
  }).first();

  await createSection.locator('input[placeholder="NIC / Passport number"]').fill("NIC12345");
  await createSection.locator('input[placeholder="MongoDB user id"]').fill("");
  await createSection.locator("input").filter({ has: page.locator("..").getByText("Guest name") }).fill(guestName);
  await createSection.locator("input").filter({ has: page.locator("..").getByText("Contact") }).fill("+94770000002");
  await createSection.locator("input").filter({ has: page.locator("..").getByText("Address") }).fill("Galle");

  const dateInputs = createSection.locator('input[type="date"]');
  await dateInputs.nth(0).fill(futureDate(8));
  await dateInputs.nth(1).fill(futureDate(10));

  await page.getByRole("button", { name: "Create reservation" }).click();
  await expect(page.getByText(guestName)).toBeVisible();

  await page.goto("/room-types");
  await expect(page.getByRole("heading", { name: "Manage Room Types" })).toBeVisible();

  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();

  await logout(page);
});
