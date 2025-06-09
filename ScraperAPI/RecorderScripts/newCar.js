const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1024,
            height: 729
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://www.insure24.com/car-insurance/?fs=FASTLANE_LANDING&ft=fl');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div:nth-of-type(2) > span.dls-link'),
            targetPage.locator('::-p-xpath(//*[@id=\\"content\\"]/div/div[3]/div[2]/span[2])'),
            targetPage.locator(':scope >>> div:nth-of-type(2) > span.dls-link')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 34.48748779296875,
                y: 12.125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(See All 48 Brands)'),
            targetPage.locator('#organic-form a'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[2]/span/div/div/div/a)'),
            targetPage.locator(':scope >>> #organic-form a'),
            targetPage.locator('::-p-text(See All 48 Brands)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 194,
                y: 17.45001220703125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div:nth-of-type(29) > div'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[2]/span/div/div/div/div/div[2]/div[29]/div)'),
            targetPage.locator(':scope >>> div:nth-of-type(29) > div')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 24,
                y: 15.587493896484375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(See All 39 Cars)'),
            targetPage.locator('#organic-form button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[3]/span/div/div/div/button)'),
            targetPage.locator(':scope >>> #organic-form button'),
            targetPage.locator('::-p-text(See all 39 Cars)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 141,
                y: 35.449981689453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div:nth-of-type(29) > div'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[3]/span/div/div/div/div/div[2]/div[29]/div)'),
            targetPage.locator(':scope >>> div:nth-of-type(29) > div')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 33,
                y: 17.587493896484375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#organic-form li:nth-of-type(2)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[3]/span/div/div/div/div[2]/ul/li[2])'),
            targetPage.locator(':scope >>> #organic-form li:nth-of-type(2)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 31,
                y: 12.587493896484375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('span:nth-of-type(22)'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[3]/span/div/div/div/div[2]/div[2]/div[3]/span[22])'),
            targetPage.locator(':scope >>> span:nth-of-type(22)'),
            targetPage.locator('::-p-text(ZXI Plus DT AMT)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 151.19998168945312,
                y: 12.7874755859375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Save & Continue)'),
            targetPage.locator('#organic-form button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[3]/div[3]/span/div/div/button)'),
            targetPage.locator(':scope >>> #organic-form button'),
            targetPage.locator('::-p-text(Save & Continue)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 192,
                y: 28.449981689453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#carFbV3Widget input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[2]/div[3]/div/div[2]/input)'),
            targetPage.locator(':scope >>> #carFbV3Widget input')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 123.94998168945312,
                y: 26.36248779296875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#carFbV3Widget input'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[2]/div[3]/div/div[2]/input)'),
            targetPage.locator(':scope >>> #carFbV3Widget input')
        ])
            .setTimeout(timeout)
            .fill('9602089889');
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(VIEW QUOTES)'),
            targetPage.locator('#organic-form button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"carFbV3Widget\\"]/div/div/div/div[2]/div[3]/div/button)'),
            targetPage.locator(':scope >>> #organic-form button'),
            targetPage.locator('::-p-text(View Quotes)')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 142.94998168945312,
                y: 17.36248779296875,
              },
            });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.pa-wrapper > div.checkbox-container span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"app\\"]/div/div[1]/div[2]/div/div/div/div[2]/div[1]/div[1]/div/span)'),
            targetPage.locator(':scope >>> div.pa-wrapper > div.checkbox-container span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 16.731201171875,
                y: 7.7937164306640625,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
