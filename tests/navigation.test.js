import { Builder, By, until } from "selenium-webdriver";

async function navigationTest() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:5173");

    const links = await driver.findElements(By.tagName("a"));

    console.log("Nombre de liens :", links.length);

    if (links.length > 0) {
      await links[0].click();

      console.log("✅ Navigation testée");
    }

  } catch (error) {
    console.error("❌ Erreur :", error);

  } finally {
    await driver.quit();
  }
}

navigationTest();