"use strict";
// lib/pdf.js – server-side PDF generation via Puppeteer
require("dotenv").config();

let browser = null;

async function getBrowser() {
  if (browser && browser.connected) return browser;
  const puppeteer = require("puppeteer");
  const launchOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  browser = await puppeteer.launch(launchOptions);
  browser.on("disconnected", () => { browser = null; });
  return browser;
}

/**
 * Render an HTML string to a PDF Buffer.
 * @param {string} html  Full HTML document
 * @param {"A4"|"Letter"} format
 * @returns {Promise<Buffer>}
 */
async function htmlToPdf(html, format = "A4") {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 });
    const buffer = await page.pdf({
      format,
      printBackground: true,
      margin: { top: "9mm", bottom: "12mm", left: "9mm", right: "9mm" },
      displayHeaderFooter: true,
      footerTemplate: `<div style="font-size:8px;color:#687585;width:100%;text-align:center;padding:0 9mm;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      headerTemplate: "<div></div>",
    });
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
}

/**
 * Stream a PDF to an HTTP response.
 */
async function streamPdf(html, res, filename = "quotation.pdf") {
  try {
    const buffer = await htmlToPdf(html);
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      "Content-Length": buffer.length,
      "Cache-Control": "no-store",
    });
    res.end(buffer);
  } catch (err) {
    console.error("[PDF] generation failed:", err.message);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "PDF generation failed" }));
    }
  }
}

/**
 * Gracefully close the browser on process exit.
 */
async function closeBrowser() {
  if (browser) { await browser.close(); browser = null; }
}

process.on("exit", () => { if (browser) { try { browser.close(); } catch {} } });
process.on("SIGTERM", async () => { await closeBrowser(); process.exit(0); });
process.on("SIGINT",  async () => { await closeBrowser(); process.exit(0); });

module.exports = { htmlToPdf, streamPdf, closeBrowser };
