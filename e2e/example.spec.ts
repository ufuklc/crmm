import { test, expect } from "@playwright/test";

test("ana sayfa başlığını gösterir", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ana Sayfa" })).toBeVisible();
});


