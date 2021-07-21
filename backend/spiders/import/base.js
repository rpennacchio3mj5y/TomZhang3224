const PCR = require('puppeteer-chromium-resolver')
const models = require('../../models')
const BaseSpider = require('../base')

class BaseImportSpider extends BaseSpider {
    constructor(platformName) {
        super(BaseSpider)
        if (!platformName) {
            throw new Error('platformId must not be empty')
        }
        this.platformName = platformName
    }

    async init() {
        // 平台
        this.platform = await models.Platform.findOne({ name: this.platformName })

        // PCR
        this.pcr = await PCR({
            revision: '',
            detectionPath: '',
            folderName: '.chromium-browser-snapshots',
            hosts: ['https://storage.googleapis.com', 'https://npm.taobao.org/mirrors'],
            retry: 3,
            silent: false
        })

        // 浏览器
        this.browser = await this.pcr.puppeteer.launch({
            executablePath: this.pcr.executablePath,
            //如果是访问https页面 此属性会忽略https错误
            ignoreHTTPSErrors: true,
            // 打开开发者工具, 当此值为true时, headless总为false
            devtools: false,
            // 关闭headless模式, 不会打开浏览器
            // headless: false,
            headless: true,
            args: [
                '–disable-gpu',
                '–disable-dev-shm-usage',
                '–disable-setuid-sandbox',
                '–no-first-run',
                '–no-sandbox',
                '–no-zygote',
                '–single-process'
            ]
        })

        // 页面
        this.page = await this.browser.newPage()

        // 设置 浏览器视窗
        await this.page.setViewport({
            width: 1300,
            height: 938
        })
    }

    async fetchArticles() {
        // to be overridden
    }

    async fetch() {
        await this.init()
        await this.setCookies()
        try {
            await this.page.goto(this.platform.url, { timeout: 0 })
        } catch (e) {
            console.error(e)
            await this.browser.close()
            return []
        }
        await this.page.waitFor(5000)
        const articles = await this.fetchArticles()
        await this.browser.close()
        return articles
    }

    async importArticles(urls) {
        // to be overridden
    }

    async import(urls) {
    }
}

module.exports = BaseImportSpider
