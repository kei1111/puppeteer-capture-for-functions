const functions = require("firebase-functions");
const puppeteer = require("puppeteer");

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "512MB",
};

exports.helloWorld = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onRequest(async (request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    const url = request.query.url;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-first-run",
        "--no-sandbox",
        "--no-zygote",
        "--single-process", // <- this one doesn't works in Windows
      ],
    });
    const page = await browser.newPage();
    const iPhone = puppeteer.devices["iPhone X"];
    await page.emulate(iPhone);
    await page.goto(url);
    const hashName = Math.random().toString(36).slice(-8);
    const fileName = hashName + ".png";
    const screenshotFullPath = "./images/" + fileName;
    const file = await page.screenshot({
      path: screenshotFullPath,
      clip: {
        x: 0,
        y: 0,
        width: 380,
        height: 290,
      },
    });
    await browser.close();
    const uploadFileBuffer = Buffer.from(file);
    response.send(uploadFileBuffer);
  });
