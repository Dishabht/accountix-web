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
    console.log("Page title:", title);

    const bodyText = await driver
      .findElement(By.tagName("body"))
      .getText();

    console.log("Visible content:", bodyText);

    console.log("✅ Test passed: page opened successfully");

  } catch (error) {
    console.error("❌ Test failed:", error);

  } finally {
    await driver.quit();
  }
}

testHomePage();