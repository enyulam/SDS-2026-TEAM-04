import { openBrowser, mint } from './hosted-cdp.mjs'
const role = process.argv[2]
const paths = process.argv.slice(3)
const jar = await mint(role)
const b = await openBrowser(9432)
try {
  await b.setCookies(jar)
  for (const p of paths) {
    await b.goto(p, { settle: 1500 })
    const t = await b.waitFor((x) => x && !/Loading the|Preparing the/.test(x), 40_000)
    console.log(`\n===== ${p} =====`)
    console.log('TEXT:', t.replace(/\s+/g, ' ').slice(0, 1100))
    const c = await b.controls()
    console.log('CONTROLS(' + c.length + '):', JSON.stringify(c.filter(x => x.text || x.aria || x.name).slice(6)).slice(0, 2400))
  }
} finally { await b.close() }
