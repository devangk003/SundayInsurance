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
            height: 714
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://www.insure24.com/motor/car-insurance/results/5ab453c9-7c19-485a-acbd-24e2b3197347/?addons=0&ll=0&pa=0&lyzd=1&ct=comprehensive');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.bucket-wrapper > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) span.pcp__left > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"app\\"]/div/div[1]/div[3]/div[2]/div[1]/div[2]/div[2]/div[1]/div/div/div[5]/span[1]/span)'),
            targetPage.locator(':scope >>> div.bucket-wrapper > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) span.pcp__left > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 31.79999542236328,
                y: 6.4375,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div:nth-of-type(2) > label'),
            targetPage.locator('::-p-xpath(//*[@id=\\"app\\"]/div/div[2]/div/div/div[2]/div[2]/div/div[2]/label)'),
            targetPage.locator(':scope >>> div:nth-of-type(2) > label')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 146.82501220703125,
                y: 26,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.cf-modal__close'),
            targetPage.locator('::-p-xpath(//*[@id=\\"app\\"]/div/div[2]/div/div/div[1])'),
            targetPage.locator(':scope >>> div.cf-modal__close')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 15.39996337890625,
                y: 19,
              },
            });
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
