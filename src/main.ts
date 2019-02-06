import { ChatPostMessageArguments } from "@slack/client";
import * as puppeteer from "puppeteer";
import { escape } from "querystring";

/**
 * Turn a Slack message object to a binary png Buffer of it as it would appear rendered in the client.
 * @param chatMessage - Slack chat.postMessage object
 * @returns Promise<Buffer> - binary png image data
 */
export default async (
  chatMessage: ChatPostMessageArguments,
): Promise<Buffer> => {
  let browser: any;
  try {
    browser = await puppeteer.launch({ headless: true });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    const fragment = escape(JSON.stringify(chatMessage));
    await page.goto(
      `https://api.slack.com/docs/messages/builder?msg=${fragment}`,
    );

    await page.waitForSelector("#message_loading_indicator", { hidden: true });

    const messageEl = await page.$(".msgs_holder");
    return await messageEl.screenshot();
  } catch (e) {
    return Promise.reject(e);
  } finally {
    try {
      await browser!.close();
    } catch (e) {
      /* catch and ignore */
    }
  }
};
