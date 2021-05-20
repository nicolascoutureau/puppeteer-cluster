//import puppeteer from 'puppeteer'
import express, {Request, Response} from 'express';
import cors from "cors";

import puppeteer from 'puppeteer-extra'

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

/*
// That's it, the rest is puppeteer usage as normal 😊
puppeteer.launch().then(async (browser:any) => {
    const page = await browser.newPage()
    await page.setViewport({ width: 800, height: 600 })

    console.log(`Testing adblocker plugin..`)
    await page.goto('https://www.vanityfair.com')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'adblocker.png', fullPage: true })

    console.log(`Testing the stealth plugin..`)
    await page.goto('https://bot.sannysoft.com')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'stealth.png', fullPage: true })

    console.log(`All done, check the screenshots. ✨`)
    await browser.close()
})
*/

const app = express()
const port = 3000

app.use(cors())

let browsers: any = [];

app.get('*', async (req: Request, res: Response) => {
    let url: any = (req.query.url || 'http://www.google.com').toString();

    try{
        url = new URL(url)
    }catch (e){
        url = null;
    }

    let {browserWSEndpoint} = await startBrowser(url);

    res.json({browserWSEndpoint});
})

app.get('/browsers', (req: Request, res: Response) => {
    res.json(browsers.length);
});

process.setMaxListeners(0)
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

const minimal_args = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];



let browser: any = null;
const getOrCreateBrowser = async () => {
    console.log('create new browser')
        // @ts-ignore
    let browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});

    console.log(`Testing the stealth plugin..`);
    const page = (await browser.pages())[0];
    await page.goto('https://bot.sannysoft.com');
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'stealth.png', fullPage: true });

    await page.goto('https://arh.antoinevastel.com/bots/areyouheadless');
    await page.waitForTimeout(1000)
    let headlessText = await page.evaluate(() => {
        let text = '';
        try{
            // @ts-ignore
            text = document.querySelector('#res').innerText;
        }catch (e) {
            console.log(e);
        }

        return text;
    });

    console.log(headlessText);


    browsers.push({browser});

    console.log(browsers.length + ' browsers en cours');

/*
    const pages = await browser.pages();
    const page = await pages[0];

    console.log(`Testing adblocker plugin..`)
    await page.goto('https://www.vanityfair.com')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'adblocker.png', fullPage: true })

    console.log(`Testing the stealth plugin..`)
    await page.goto('https://bot.sannysoft.com')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'stealth.png', fullPage: true })
*/

    return {
        browser
    };
    /*            {
                /!*headless: true,*!/
                //args: minimal_args
    /!*            args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    /!*'--single-process',*!/
                    '--disable-gpu'
                ],*!/
            }*/
};

const startBrowser = async (url: URL|null) => {
    const {browser} = await getOrCreateBrowser();

    //const pages = await browser.pages();
    //const page = await pages[0];
    //const page = await browser.newPage();

    const browserWSEndpoint = await browser.wsEndpoint();

/*    try{
        console.log('go to', url.href);
        await page.goto(url.href);
        await page.screenshot({ path: 'a.png', fullPage: true })
    } catch (e){
        console.log("can't go to ", url, e)
    }*/

    return {
        browserWSEndpoint
    }
}
