import { test, expect } from "@playwright/test";
import { prisma } from "../src/lib/prisma";

async function startNewGame(page) {
  await page.goto('/');
  await page.fill('input[placeholder="❌ Your Name"]', 'John');
  await page.fill('input[placeholder="⭕ Opponent Name"]', 'Maria');
  await Promise.all([
      page.waitForNavigation(), // Ensures navigation has finished
      page.click('button:has-text("Start Game")'), // Initiates navigation
  ]);
  await page.waitForSelector('h1:has-text("Loading..🔃")', { state: 'detached' });
}

test.describe("Gameplay", () => {
  test.beforeEach(async ({ page }) => {
    await prisma.game.deleteMany();
    await page.goto("/");
  });

  test.afterEach(async () => {
    await prisma.game.deleteMany();
  });

  test("should navigate to index page and have H1 title", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");
    // Check if the page's h1 text matches 'Tic Tac Toe #️⃣'
    await expect(page.locator("h1")).toHaveText("Tic Tac Toe #️⃣");

    // Check if the page has an input with placeholder="❌ Your Name"
    await expect(
      page.locator('input[placeholder="❌ Your Name"]')
    ).toBeVisible();

    // Check if the page has an input with placeholder="⭕ Opponent Name"
    await expect(
      page.locator('input[placeholder="⭕ Opponent Name"]')
    ).toBeVisible();

    // Check if the page has a button with the text "Start Game"
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();

    // Check if the page has a link with the text "See all games" and href="/game/list"
    await expect(page.locator('a[href="/game/list"]')).toHaveText(
      "See all games"
    );
  });

  test("Gameplay Your Name Wins", async ({ page }) => {
    // Navigate to the page where the inputs and button are located
    await page.goto('/');
  
    // Input player names
    await page.fill('input[placeholder="❌ Your Name"]', 'John');
    await page.fill('input[placeholder="⭕ Opponent Name"]', 'Maria');
  
    // Start the game
    await Promise.all([
      page.waitForNavigation(), // Ensures navigation has finished
      page.click('button:has-text("Start Game")'), // Initiates navigation
    ]);
  
    // Wait for the game to fully load, check for absence of loading indicator as confirmation
    await page.waitForSelector('h1:has-text("Loading..🔃")', { state: 'detached' });
    // 0 1 2
    // 3 4 5
    // 6 7 8
    // Sequence of moves leading to a draw
    const moves = [
      { player: '❌ John', cell: '0' },
      { player: '⭕ Maria', cell: '3' },
      { player: '❌ John', cell: '1' },
      { player: '⭕ Maria', cell: '4' },
      { player: '❌ John', cell: '2' },
    ];

    for (const { player, cell } of moves) {

      await page.waitForSelector(`h1:has(div:has-text("${player}"))`, { timeout: 20000 });

      // Now perform the expectation check
      await expect(page.locator('h1 >> div')).toHaveText(player);
  
      // Make the move
      await page.click(`[data-testid="cell-${cell}"]`);
    }
    // Check for John wins! message at the end
    await expect(page.locator("h1")).toContainText("❌ John  Won");
  });

  test('Gameplay Draw', async ({ page }) => {
    // Navigate to the page where the inputs and button are located
    await page.goto('/');
  
    // Input player names
    await page.fill('input[placeholder="❌ Your Name"]', 'John');
    await page.fill('input[placeholder="⭕ Opponent Name"]', 'Maria');
  
    // Start the game
    await Promise.all([
      page.waitForNavigation(), // Ensures navigation has finished
      page.click('button:has-text("Start Game")'), // Initiates navigation
    ]);
  
    // Wait for the game to fully load, check for absence of loading indicator as confirmation
    await page.waitForSelector('h1:has-text("Loading..🔃")', { state: 'detached' });
  
    // Sequence of moves leading to a draw
    const moves = [
      { player: '❌ John', cell: '0' },
      { player: '⭕ Maria', cell: '1' },
      { player: '❌ John', cell: '2' },
      { player: '⭕ Maria', cell: '4' },
      { player: '❌ John', cell: '3' },
      { player: '⭕ Maria', cell: '5' },
      { player: '❌ John', cell: '7' },
      { player: '⭕ Maria', cell: '6' },
      { player: '❌ John', cell: '8' },
    ];

    for (const { player, cell } of moves) {

      await page.waitForSelector(`h1:has(div:has-text("${player}"))`, { timeout: 20000 });

      // Now perform the expectation check
      await expect(page.locator('h1 >> div')).toHaveText(player);
  
      // Make the move
      await page.click(`[data-testid="cell-${cell}"]`);
    }
  
    // Check for draw message at the end
    await expect(page.locator('h1')).toContainText("It's a draw!");
  });
});
