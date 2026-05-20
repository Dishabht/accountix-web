import { Builder, By, until } from "selenium-webdriver";

async function navigationTest() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // Step 1: Login
    await driver.get("http://localhost:5173/login");

    const emailInput = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-email']")),
      5000
    );

    try {
      await emailInput.sendKeys("admin@portal.com");
    } catch (e) {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        emailInput,
        "admin@portal.com"
      );
    }

    const passwordInput = await driver.findElement(By.css("[data-testid='login-password']"));
    try {
      await passwordInput.sendKeys("admin123");
    } catch (e) {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        passwordInput,
        "admin123"
      );
    }

    const loginButton = await driver.findElement(By.css("[data-testid='login-button']"));
    await loginButton.click();

    // Step 2: Wait for dashboard
    await driver.wait(
      until.elementLocated(By.css("[data-testid='sign-out-button']")),
      5000
    );

    // Step 3: Count available navigation pages
    const navLinks = await driver.findElements(By.css("[data-testid^='nav-link-']"));
    console.log(`Found ${navLinks.length} navigation pages`);
    
    for (let i = 0; i < navLinks.length; i++) {
      const text = await navLinks[i].getText();
      console.log(`  - Page ${i + 1}: ${text}`);
    }

    // Step 4: Click on Employees menu link
    const employeesLink = await driver.findElement(By.css("[data-testid='nav-link-employees']"));
    await employeesLink.click();

    // Step 5: Verify we're on Employees page
    await driver.wait(
      until.urlContains("/employees"),
      5000
    );

    // Step 6: Verify Employees page is loaded with table or content
    const employeeTable = await driver.wait(
      until.elementLocated(By.css("table")),
      3000
    );

    const addEmployeeButton = await driver.findElement(By.css("[data-testid='employee-add-button']"));
    
    console.log("✅ Navigation tested - Employees page accessible");
    console.log("✅ Employee table loaded");
    console.log("✅ Add Employee button found");

  } catch (error) {
    console.error("❌ Error:", error);

  } finally {
    await driver.quit();
  }
}

navigationTest();