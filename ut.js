const puppeteer = require('puppeteer');

// 日付をYYYY-MM-DDの書式で返すメソッド
const formatDate = (dt) => {
  var y = dt.getFullYear();
  var m = ('00' + (dt.getMonth() + 1)).slice(-2);
  var d = ('00' + dt.getDate()).slice(-2);
  return y + m + d;
};
const argDate = formatDate(new Date(process.argv[4]));

(async () => {
  // debug
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   slowMo: 1, // slow down by 250ms
  // });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://jra.flpjp.com/', {
    waitUntil: 'load',
    timeout: 0
  });
  await page.type('#userid', process.argv[2])
  await page.type('#passwd', process.argv[3])

  await page.click('a#btn_login'),
  await page.waitForTimeout(1500)
  await page.click('#attention_window_notice > div.attention-agree-checkbox > label > input[type="checkbox"]')
  await page.waitForTimeout(200)
  await page.click('#attention_button_0')
  await page.screenshot({ path: 'example2.png' });
  // URLがリンクであることを取得する
  const hrefs = await page.$$eval('#calmonth_1 > table a', hrefs => hrefs.map((a) => a.href));

  // @TODO リンク自動生成 東京競馬場
  if (!hrefs.includes(`https://jra.flpjp.com/seatSelect/${argDate}_5`)) {
    console.log('not exists.')
  } else {
    console.log('hakken')
  }

  // @TODO 500円のチケットを自動仮押さえ
  await browser.close();
})();