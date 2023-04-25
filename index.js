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
    const url = request.query.url;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--lang=ja,en-US,en"],
    });
    const page = await browser.newPage();
    const iPhone = puppeteer.devices["iPhone X"];

    await page.setDefaultNavigationTimeout(60000);
    await page.emulate(iPhone);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
      page.goto(url),
    ]);
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
