const BaseSpider = require('./base')
const constants = require('../constants')

class SegmentfaultSpider extends BaseSpider {
    async afterInputEditor() {
        const tags = this.task.tag.split(',')
        const elTagInput = await this.page.$('.sf-typeHelper-input')
        for (const tag of tags) {
            await elTagInput.type(tag)
            await this.page.waitFor(1000)
            await elTagInput.type(',')
            await this.page.waitFor(1000)
        }
        await this.page.waitFor(3000)
    }

    async afterPublish() {
        this.task.url = this.page.url()
        this.task.updateTs = new Date()
        this.task.status = constants.status.FINISHED
        await this.article.save()
    }
}

module.exports = SegmentfaultSpider
