import { expect, test } from "@playwright/test";

import { futureDate, loginAs, logout } from "./helpers/auth";

test("customer can create reservation", async ({ page }) => {
  await loginAs(page, "customer", "Password@123");

  await page.goto("/my-reservations");
  await expect(page.getByRole("heading", { name: "Your Stays" })).toBeVisible();

  await page.getByRole("link", { name: "New reservation" }).click();
  await expect(page.getByRole("heading", { name: "Book Your Stay" })).toBeVisible();

  await page.getByLabel("Guest name").fill("E2E Customer Guest");
  await page.getByLabel("Contact number").fill("+94770000001");
  await page.getByLabel("Address").fill("Colombo");
  await page.getByLabel("Check-in").fill(futureDate(5));
  await page.getByLabel("Check-out").fill(futureDate(7));

  await page.getByRole("button", { name: "Confirm reservation" }).click();

  await expect(page).toHaveURL(/\/my-reservations\/.+/);
  const reservationUrl = page.url();
  const reservationNo = reservationUrl.split("/my-reservations/")[1];

  await page.goto("/my-reservations");
  await expect(page.getByRole("heading", { name: "Your Stays" })).toBeVisible();
  await expect(page.getByText(reservationNo)).toBeVisible();

  await logout(page);
});
