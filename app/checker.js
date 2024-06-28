import "dotenv/config";
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

puppeteer.use(
  AdblockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
  })
);

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: process.env.CAPTCHA2, // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
  })
);

export async function getCheck(text) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "-single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const page = await browser.newPage();
  
  // User Agent Setting
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua);
  
  await page.goto("https://www.duplichecker.com", {
    waitUntil: "networkidle2",
  });

  // Size of browser
  await page.setViewport({ width: 1080, height: 1024 });

  // Wait for the search box to be available
  try {
    await page.waitForSelector("#textBox", { visible: true, timeout: 10000 });
  } catch (error) {
    console.error("Error: No element found for selector: #textBox");
    await browser.close();
    throw error;
  }

  // Type into search box
  await page.type("#textBox", text);

  // Solve reCAPTCHAs
  await page.solveRecaptchas();

  // Click on the button
  await page.click('input[name="check"]');

  // Wait for the results to load
  await page.waitForSelector(".result_sec_home", { visible: true });

  // Locate and scroll the target element into view
  const results = await page.$("#result_sec_home");
  // await results.scrollIntoView({ behavior: "smooth", block: "center" });

  // Wait for this to complete
  await page.$("#loading_img");
  // Wait for the element to appear
  await page.waitForSelector("#loading_tool_name");

  // Wait for the content of the element to change
  await page.waitForFunction(() => {
    const element = document.querySelector("#loading_tool_name");
    return element && element.textContent.includes("Scanning Plagiarism 100%");
  });

  // Additional wait time to ensure results are fully loaded
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  await sleep(5000);

  // Wait for the loading screen to disappear
  await page.waitForSelector("#word-count_below", { visible: true });
  await page.waitForSelector("#no_of_rzlt_fond", { visible: true });
  await page.waitForSelector(".plag_percentage", { visible: true });
  await page.waitForSelector(".unique_percentage", { visible: true });

  // Extract the values
  const wordCount = await page.$eval("#word-count_below", (el) =>
    el.textContent.trim()
  );
  const resultsFound = await page.$eval("#no_of_rzlt_fond", (el) =>
    el.textContent.trim()
  );
  const plagiarismPercentage = await page.$eval(".plag_percentage", (el) =>
    el.textContent.trim()
  );
  const uniquePercentage = await page.$eval(".unique_percentage", (el) =>
    el.textContent.trim()
  );

  // Close browser instance
  await browser.close();

  // Return data
  return {
    wordCount,
    resultsFound,
    plagiarismPercentage,
    uniquePercentage,
  };
}

export default getCheck;
