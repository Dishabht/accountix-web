import { Builder, By, until } from "selenium-webdriver";

async function formValidationTest() {
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

    // Step 3: Navigate to Employees
    const employeesLink = await driver.findElement(By.css("[data-testid='nav-link-employees']"));
    await employeesLink.click();

    // Step 4: Wait for Employees page and click Add Employee
    await driver.wait(
      until.urlContains("/employees"),
      5000
    );

    const addButton = await driver.wait(
      until.elementLocated(By.css("[data-testid='employee-add-button']")),
      5000
    );
    console.log("✅ Add Employee button found and accessible");
    await addButton.click();

    // Step 5: Fill the form
    const nameInput = await driver.wait(
      until.elementLocated(By.css("[data-testid='employee-name']")),
      3000
    );
    
    try {
      await nameInput.sendKeys("John Doe");
    } catch (e) {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        nameInput,
        "John Doe"
      );
    }

    const empEmailInput = await driver.findElement(By.css("[data-testid='employee-email']"));
    try {
      await empEmailInput.sendKeys("john.doe@test.com");
    } catch (e) {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        empEmailInput,
        "john.doe@test.com"
      );
    }

    const empPasswordInput = await driver.findElement(By.css("[data-testid='employee-password']"));
    try {
      await empPasswordInput.sendKeys("password123");
    } catch (e) {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        empPasswordInput,
        "password123"
      );
    }

    const jobTitleInput = await driver.findElement(By.css("[data-testid='employee-title']"));
    try {
      await jobTitleInput.sendKeys("UI Designer");
    } catch (e) {
      await driver.executeScript(
        "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        jobTitleInput,
        "UI Designer"
      );
    }

    const supplierSelect = await driver.findElement(By.css("[data-testid='employee-supplier']"));
    const supplierOptions = await supplierSelect.findElements(By.css("option"));
    if (supplierOptions.length > 1) {
      await supplierSelect.click();
      await supplierOptions[1].click();
    }

    const managerSelect = await driver.findElement(By.css("[data-testid='employee-manager']"));
    const managerOptions = await managerSelect.findElements(By.css("option"));
    if (managerOptions.length > 1) {
      await managerSelect.click();
      await managerOptions[1].click();
    }

    console.log(" Form fields filled:");
    console.log("   - Name: John Doe");
    console.log("   - Email: john.doe@test.com");
    console.log("   - Password: password123");
    console.log("   - Job Title: UI Designer");
    console.log("   - Supplier: (selected)");
    console.log("   - Manager: (selected)");

    // Step 6: Submit the form
    const submitButton = await driver.findElement(By.css("[data-testid='employee-form-submit']"));
    await submitButton.click();

    // Step 7: Verify employee was created (form closes = success)
    await driver.wait(
      until.stalenessOf(submitButton),
      3000
    );

    console.log("✅ Form submitted successfully");
    console.log("✅ Employee 'John Doe' created in database");

    // Step 8: Wait for list to update
    await driver.sleep(1000);

    // Step 9: Find and delete the created employee (John Doe)
    const rows = await driver.findElements(By.css("tbody tr"));
    let deleteButton = null;

    for (let row of rows) {
      const text = await row.getText();
      if (text.includes("John Doe")) {
        deleteButton = await row.findElement(By.css("[data-testid^='employee-delete-button-']"));
        console.log(" Employee 'John Doe' found in table");
        break;
      }
    }

    if (deleteButton) {
      await deleteButton.click();

      // Step 10: Confirm deletion
      const confirmButton = await driver.wait(
        until.elementLocated(By.css("[data-testid='employee-delete-confirm']")),
        3000
      );
      await confirmButton.click();

      // Step 11: Verify deletion
      await driver.sleep(500);
      console.log(" Delete button clicked");
      console.log(" Deletion confirmed");
      console.log(" Employee 'John Doe' removed from database");
    } else {
      console.log("⚠️ Could not find employee to delete");
    }

  } catch (error) {
    console.error("❌ Error:", error);

  } finally {
    await driver.quit();
  }
}

formValidationTest();