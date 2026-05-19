import { Builder, By, until } from "selenium-webdriver";

async function loginTest() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:5173");

    const emailInput = await driver.wait(
      until.elementLocated(By.css("input[type='email']")),
      5000
    );

    await emailInput.sendKeys("test@test.com");

    const passwordInput = await driver.findElement(
      By.css("input[type='password']")
    );

    await passwordInput.sendKeys("123456");

    const loginButton = await driver.findElement(
      By.css("button[type='submit']")
    );

    await loginButton.click();

    console.log("✅ Login exécuté");

  } catch (error) {
    console.error("❌ Erreur :", error);

  } finally {
    await driver.quit();
  }
}

loginTest();