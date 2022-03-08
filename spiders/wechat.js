const request = require('request-promise-native')
const ObjectId = require('bson').ObjectId
const fs = require('fs')
const BaseSpider = require('./base')
const constants = require('../constants')
const models = require('../models')
const config = require('./config')
const logger = require('../logger')

class WechatSpider extends BaseSpider {
  async init() {
    // 任务
    this.task = await models.Task.findOne({ _id: ObjectId(this.taskId) })
    if (!this.task) {
      throw new Error(`task (ID: ${this.taskId}) cannot be found`)
    }

    // 文章
    this.article = await models.Article.findOne({ _id: this.task.articleId })
    if (!this.article) {
      throw new Error(`article (ID: ${this.task.articleId.toString()}) cannot be found`)
    }

    // 平台
    this.platform = await models.Platform.findOne({ _id: this.task.platformId })
    if (!this.platform) {
      throw new Error(`platform (ID: ${this.task.platformId.toString()}) cannot be found`)
    }

    // 配置
    this.config = config[constants.platform.WECHAT]

    // accessToken
    this.token = undefined
  }

  async run() {
    // 初始化
    await this.init()

    // 获取Access Token
    await this.getAccessToken()

    // 添加封面图片
    await this.uploadThumbImage()

    // 加入素材
    await this.addMaterial()
  }

  async afterInputEditor() {
  }

  async fetchStats() {
  }

  async getAccessToken() {
    let token = await models.Token.findOne({ platformName: constants.platform.WECHAT })
    if (!token || token.expiresTs < (new Date())) {
      logger.info('fetching access token')
      // 如果没有token或者token过期了
      const appIdEnv = await models.Environment.findOne({ _id: constants.environment.WECHAT_APP_ID })
      const appSecretEnv = await models.Environment.findOne({ _id: constants.environment.WECHAT_APP_SECRET })
      const response = await request.get(`${this.config.urls.apiEndpoint}/token?grant_type=client_credential&appid=${appIdEnv.value}&secret=${appSecretEnv.value}`)
      const data = JSON.parse(response)
      if (data.access_token) {
        token = new models.Token({
          accessToken: data.access_token,
          expiresTs: new Date(+new Date() + data.expires_in * 1e3),
        })
        await token.save()
      } else {
        console.error(`[${data.errcode}] ${data.errmsg}`)
        throw new Error('cannot get access_token');
      }
    }
    this.token = token
  }

  async uploadThumbImage() {
    const data = await request.post(`${this.config.urls.apiEndpoint}/material/add_material?access_token=${this.token.accessToken}&type=image`, {
      formData: {
        media: fs.createReadStream('/Users/marvzhang/projects/artipub/public/favicon.png'),
      },
      json: true,
    })
    console.log(data)
    this.mediaId = data.media_id
    this.mediaUrl = data.url
  }

  async addMaterial() {
    const data = await request.post(`${this.config.urls.apiEndpoint}/material/add_news?access_token=${this.token.accessToken}`, {
      body: {
        articles: [{
          title: this.task.title || this.article.title,
          thumb_media_id: this.mediaId,
          author: this.task.author || 'Admin',
          show_cover_pic: this.task.showCovPic || 0,
          content: this.article.contentHtml,
          content_source_url: '',
          need_open_comment: this.task.needOpenComment || 0,
          only_fans_can_comment: this.task.onlyFansCanComment || 0
        }]
      },
      json: true,
    })
    console.log(data)
  }
}

module.exports = WechatSpider
