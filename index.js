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
        // "--disable-gpu",
        // "--disable-dev-shm-usage",
        // "--disable-setuid-sandbox",
        // "--no-first-run",
        "--no-sandbox",
        // "--no-zygote",
        // "--single-process",
        "--lang=ja,en-US,en",
      ],
    });
    const page = await browser.newPage();
    // await page.setExtraHTTPHeaders({
    //   "Accept-Language": "ja-JP",
    // });
    const iPhone = puppeteer.devices["iPhone X"];
    await page.emulate(iPhone);
    await page.setDefaultNavigationTimeout(30000);
    await page.goto(url);
    await page.waitForNavigation({ waitUntil: "load" });
    await page.addStyleTag({
      content: `body {font-family: "IPA Pゴシック","IPA PGothic" !important;}`,
    });

    functions.logger.info(url);

    const file = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: 380,
        height: 290,
      },
    });
    await browser.close();
    const base64Screenshot = file.toString("base64");
    response.send(base64Screenshot);
  });
