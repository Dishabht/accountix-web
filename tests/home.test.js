import { Builder, By, until } from "selenium-webdriver";

async function testHomePage() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:5173");

    await driver.wait(
      until.elementLocated(By.tagName("body")),
      5000
    );

    const title = await driver.getTitle();
    console.log("Titre de la page :", title);

    const bodyText = await driver
      .findElement(By.tagName("body"))
      .getText();

    console.log("Contenu visible :", bodyText);

    console.log("✅ Test réussi : la page s'ouvre bien");

  } catch (error) {
    console.error("❌ Test échoué :", error);

  } finally {
    await driver.quit();
  }
}

testHomePage();