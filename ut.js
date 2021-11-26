const puppeteer = require('puppeteer');

// 日付をYYYY-MM-DDの書式で返すメソッド
const formatDate = (dt) => {
  var y = dt.getFullYear();
  var m = ('00' + (dt.getMonth() + 1)).slice(-2);
  var d = ('00' + dt.getDate()).slice(-2);
  return y + m + d;
};
const argDate = formatDate(new Date(process.env.targetDate || process.argv[4]));

// リンク用数値
const targetTokyo = 5; // 東京
const targetHanshin = 9; // 阪神

(async () => {
  // debug
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 25, // slow down by 250ms
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  // const browser = await puppeteer.launch();
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
  // 15秒待機
  await page.waitForTimeout(15000)
  // ログイン項目入力
  await page.type('#userid', process.env.userID || process.argv[2])
  await page.type('#passwd', process.env.password || process.argv[3])

  // ログインボタン
  await page.click('a#btn_login'),
  await page.waitForTimeout(1500)
  // 上記内容を確認しました
  await page.click('#attention_window_notice > div.attention-agree-checkbox > label > input[type="checkbox"]') // @TODO
  // 次へ進む
  await page.click('#attention_button_0')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'example2.png' });
  // console.debug(srcs)

  // 満席チェック
  const url = `https://jra.flpjp.com/seatSelect/${argDate}_${targetTokyo}`
  // if (!hrefs.includes(url)) {
  //   await page.screenshot({ path: 'example2_no.png' });
  //   console.log('not exists.')
  //   await browser.close()
  //   return
  // }
  await page.goto(url, {
    waitUntil: 'load',
    timeout: 0
  });
  await page.waitForTimeout(500)

  let count = 0
  let links = {}
  do {
    if (count > 5) {
      break
    }
    if (count > 0) {
      await page.reload()
      await page.waitForTimeout(1000)
    }
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

    links = await page.$$eval('a.ticket_auto_link', list => list.map(item => item.outerHTML).filter(item => item.includes('ticketprice="500"')));
    count++
  } while (links.length > 0)

  // 500円のチケットを自動仮押さえ
   await page.click('a.ticket_auto_link')

  // 選択した席種を「検討中の座席」に追加しました。
  await page.click('.ajs-button')
  await page.waitForTimeout(500)
  // 自動で座席を割り当て 仮押さえする
  await page.click('#submitAButton')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'example3_2.png' });
  // 次のステップに進む(会員情報の入力に進む)
  await page.click('#need_attention')
  await page.waitForTimeout(500)
  // 上記内容を確認しました
  await page.click('#attention_window > div.attention-agree-checkbox > label > input[type=checkbox]')
  // 次へ進む
  await page.click('#attention_button_1')
  await page.waitForTimeout(1500)
  // 個人情報保護方針に同意するチェックボックス
  await page.click('#agree')

  // クレジットカードセキュリティコード
  await page.type('#id_old_security_code', process.env.code || process.argv[5])

  // 範囲外ダミークリック
  await page.click('#nts102_form > div:nth-child(14) > div > p:nth-child(2) > label')
  await page.waitForTimeout(1500)

  // ページ最下部までスクロール
  await page.evaluate(() => {
    document.scrollingElement.scrollTop = document.body.scrollHeight
  })
  await page.screenshot({ path: 'example4.png' })

  // 確認する
  await page.click('#btn_billing_settle')
  await page.waitForTimeout(1500)

  // 同意するラジオボタン
  await page.click('#agree2')

  // 確定する
  await page.click('#nts006_buy')
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'example5.png' })
  await browser.close();
})();