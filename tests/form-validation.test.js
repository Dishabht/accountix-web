import { Builder, By, until } from "selenium-webdriver";

async function formValidationTest() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:5173");

    const loginButton = await driver.wait(
      until.elementLocated(By.css("button[type='submit']")),
      5000
    );

    await loginButton.click();

    console.log("✅ Formulaire soumis sans données");

  } catch (error) {
    console.error("❌ Erreur :", error);

  } finally {
    await driver.quit();
  }
}

formValidationTest();