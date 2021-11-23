const puppeteer = require('puppeteer');

// 日付をYYYY-MM-DDの書式で返すメソッド
const formatDate = (dt) => {
  var y = dt.getFullYear();
  var m = ('00' + (dt.getMonth() + 1)).slice(-2);
  var d = ('00' + dt.getDate()).slice(-2);
  return y + m + d;
};
const argDate = formatDate(new Date(process.argv[4]));

// リンク用数値
const targetTokyo = 5; // 東京
const targetHanshin = 9; // 阪神

(async () => {
  // debug
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   slowMo: 1, // slow down by 250ms
  // });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 1500,
  })
  await page.goto('https://jra.flpjp.com/', {
    waitUntil: 'load',
    timeout: 0,
    args: [
      '--window-size=1200,1000',
    ]
  });
  await page.type('#userid', process.argv[2])
  await page.type('#passwd', process.argv[3])

  await page.click('a#btn_login'),
    await page.waitForTimeout(1500)
  // 上記内容を確認しました
  await page.click('#attention_window_notice > div.attention-agree-checkbox > label > input[type="checkbox"]')
  // 次へ進む
  await page.click('#attention_button_0')
  await page.waitForTimeout(200)
  await page.screenshot({ path: 'example2.png' });
  // URLがリンクであることを取得する
  const hrefs = await page.$$eval('#calmonth_1 > table a', hrefs => hrefs.map((a) => a.href));

  // 満席チェック
  const url = `https://jra.flpjp.com/seatSelect/${argDate}_${targetHanshin}`
  if (!hrefs.includes(url)) {
    console.log('not exists.')
    await browser.close()
    return
  }
  await page.goto(url, {
    waitUntil: 'load',
    timeout: 0
  });
  // 上記内容を確認しました
  await page.click('div.attention-agree-checkbox > label > input[type="checkbox"]')
  // 次へ進む
  await page.click('#attention_button_1')
  // おまかせ席選択で購入する
  await page.click('#p03A_auto_open')

  // ページ最下部までスクロール
  await page.evaluate(() => {
    document.scrollingElement.scrollTop = document.body.scrollHeight
  })
  await page.screenshot({ path: 'example3.png' });


  // 500円のチケットを自動仮押さえ
  // @TODO 動的に選択する
  await page.click('a.ticket_auto_link')
  // 選択した席種を「検討中の座席」に追加しました。
  await page.click('.ajs-button')
  // 自動で座席を割り当て 仮押さえする
  await page.click('#submitAButton')
  await page.waitForTimeout(1500)
  // 次のステップに進む(会員情報の入力に進む)
  await page.click('#need_attention')
  // 上記内容を確認しました
  await page.click('div.attention-agree-checkbox > label > input[type="checkbox"]')
  // 次へ進む
  await page.click('#attention_button_1')
  await page.waitForTimeout(1500)
  // 同意する
  await page.click('#agree')

  await page.screenshot({ path: 'example4.png' });
  await browser.close();
})();