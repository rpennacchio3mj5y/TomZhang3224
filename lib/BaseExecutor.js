const spiders = require('../spiders')
const models = require('../models')
const constants = require('../constants')

class BaseExecutor {
    constructor(task) {
        this.task = task
        this.platform = undefined
        this.spider = undefined
    }

    async init() {
        const task = this.task

        // 平台
        this.platform = await models.Platform.findOne({ _id: task.platformId })
        const spiderName = this.platform.name

        let spider
        if (spiderName === constants.platform.JUEJIN) {
            spider = new spiders.JuejinSpider(task._id)
        } else if (spiderName === constants.platform.SEGMENTFAULT) {
            spider = new spiders.SegmentfaultSpider(task._id)
        } else if (spiderName === constants.platform.JIANSHU) {
            spider = new spiders.JianshuSpider(task._id)
        } else if (spiderName === constants.platform.CSDN) {
            spider = new spiders.CsdnSpider(task._id)
        } else if (spiderName === constants.platform.ZHIHU) {
            spider = new spiders.ZhihuSpider(task._id)
        } else if (spiderName === constants.platform.OSCHINA) {
          spider = new spiders.OschinaSpider(task._id)
        } else if (spiderName === constants.platform.TOUTIAO) {
          spider = new spiders.ToutiaoSpider(task._id)
        } else if (spiderName === constants.platform.CNBLOGS) {
          spider = new spiders.CnblogsSpider(task._id)
        } else if (spiderName === constants.platform.V2EX) {
          spider = new spiders.V2exSpider(task._id)
        }
        this.spider = spider
    }

    async run() {
        // to be inherited
    }

    async start() {
        await this.init()
        await this.run()
    }
}

module.exports = BaseExecutor
