import * as playwright from 'playwright-aws-lambda';
import { getAbsoluteURL } from '../../styles/util';

const generateCover = async (req, res) => {
  let browser;
  let data;

  try {
    browser = await playwright.launchChromium();

    const page = await browser.newPage({
      ignoreHTTPSErrors: true,
      javaScriptEnabled: false,
      colorScheme: 'dark',
      viewport: {
        width: 610,
        height: 385
      }
    });

    await page.goto(
      getAbsoluteURL(`/_internal/cover/${req.query.slug || ''}`,
      process.env.VERCEL_URL
    ));

    await page.waitForLoadState();

    data = await page.screenshot({ type: 'png' });
  } finally {
    if (browser) await browser.close();
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  res.setHeader('Content-Type', 'image/png');
  res.end(data);
}

export default generateCover;
