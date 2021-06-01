const fs = require('fs')
const path = require('path')

jest.setTimeout(300000)

const filepath = path.join(__dirname, '..', 'dev/nextjs-project/data/default.json')

const deleteData = async () => {
    const hasData = await fs.promises.stat(filepath).then(() => true).catch(() => false)
    if (hasData) {
        fs.promises.unlink(filepath)
    }
}

describe('Load editor', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3000', { waitUntil: 'load' })
    })
    it('should contain a "gjs" element', async () => {
        await expect(page.$('#gjs')).resolves.not.toBeNull()
    })
    it('should add block to canvas', async () => {
        await page.waitForSelector('#gjs')

        await page.waitForSelector('#gjs .gjs-pn-panel.gjs-pn-options .gjs-pn-btn.fa-trash')
        const button = await page.$('#gjs .gjs-pn-panel.gjs-pn-options .gjs-pn-btn.fa-trash')

        await page.waitForTimeout(1000)

        let confirmed = false
        await page.on('dialog', async dialog => {if (!confirmed) { await dialog.accept(); confirmed = true }})
        await button.click()

        await page.waitForTimeout(1000)

        await page.waitForSelector('#gjs .gjs-block-category.gjs-open')
        const blockCategory = await page.$('#gjs .gjs-block-category.gjs-open')
        const block = await blockCategory.$('.gjs-blocks-c > div:nth-child(2)')

        const {x, y, width, height} = await block.boundingBox()
        await page.mouse.move(x + width / 2, y + height / 2)
        await page.mouse.down()
        await page.mouse.move(-1000, 0)
        await page.mouse.up()

        await page.waitForTimeout(1000)

        const iframeElement = await page.$('#gjs .gjs-frame')
        const iframe = await iframeElement.contentFrame()
        const wrapper = await iframe.$('#wrapper')
        const heading =  await wrapper.$eval('div > div > div:nth-child(2) h1', el => el.textContent)
        expect(heading).toMatch('The Catalyzer')

        await deleteData()
    })
})