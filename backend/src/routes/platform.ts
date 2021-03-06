const ObjectId = require('bson').ObjectId
import constants from '../constants'
import {Router} from 'express'
import models from '../models'
import * as Result from '../utils/result'
import logger from '../logger'
import BaseSpider from 'src/spiders/base'
const router = Router();
const { UserPlatform, Platform } = models;

const getCookieStatus = async (platform: any, userId) => {
  const cookies = await models.Cookie.find({ domain: { $regex: platform.name } , user: userId })
  if (!cookies || !cookies.length) return constants.cookieStatus.NO_COOKIE
  return constants.cookieStatus.EXISTS
}

const getLoginStatus = async (platform: any, userId) => {
  const platformState = await models.UserPlatform.findOne({ user: userId, platform: platform._id })
  return platformState?.loggedIn;
}

const getPlatformList = async (req, res) => {
  const platforms = await Platform.find();
    for (let platform of platforms) {
      platform.loggedIn = await getLoginStatus(platform, req.user._id)
    }
    await Result.success(res, platforms)
  };
const getPlatform = async (req, res) => {
    const platform = await UserPlatform.findOne({ _id: ObjectId(req.params.id) , user: req.user._id })
    platform.cookieStatus = await getCookieStatus(platform, req.user._id)
    await Result.success(res, platform)
  };
const addPlatform = async (req, res) => {
        let Platform = new models.Platform({
      name: req.body.name,
      label: req.body.label,
      editorType: req.body.editorType,
      description: req.body.description,
      enableImport: req.body.enableImport,
      enableLogin: req.body.enableLogin,
      username: req.body.username,
      password: req.body.password,
    })
    Platform = await Platform.save()
    await Result.success(res, Platform)
  };
const editPlatform = async (req, res) => {
    let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
    if (!platform) {
      return await Result.notFound(res)
    }
    platform.name = req.body.name
    platform.label = req.body.label
    platform.editorType = req.body.editorType
    platform.description = req.body.description
    platform.enableImport = req.body.enableImport
    platform.enableLogin = req.body.enableLogin
    platform.username = req.body.username
    platform.password = req.body.password
    platform.updateTs = new Date()
    platform.save()
    await Result.success(res, platform)
  return;
  };
const deletePlatform = async (req, res) => {
    let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
    if (!platform) {
      return Result.notFound(res)
    }
    await models.Platform.remove({ _id: ObjectId(req.params.id) })
    return Result.success(res, platform)
  };
const getPlatformArticles = async (req, res) => {
    // ????????????
    const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })

    // ??????????????????????????????404??????
    if (!platform) {
      return Result.notFound(res)
    }

    // ?????????????????????
    const ImportSpider = require('../spiders/import/' + platform.name)

    // ??????????????????
    const spider = new ImportSpider(platform.name)

    // ????????????????????????
    const siteArticles = await spider.fetch()

    // ????????????????????????
    for (let i = 0; i < siteArticles.length; i++) {
      // ??????????????????
      const siteArticle = siteArticles[i]

      // ??????title????????????????????????
      const article = await models.Article.findOne({ title: siteArticle.title })

      // ????????????????????????
      siteArticles[i].exists = !!article

      // ???????????????????????????????????????
      let task
      if (article) {
        siteArticles[i].articleId = article._id
        task = await models.Task.findOne({ platformId: platform._id, articleId: article._id })
      }

      // ???????????????????????????
      siteArticles[i].associated = !!(task && task.url && task.url === siteArticle.url)
    }

    // ????????????
    return Result.success(res, siteArticles)
  };
const importPlatformArticles = async (req, res) => {
    // ????????????
    const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })

    // ??????????????????????????????404??????
    if (!platform) {
      return Result.notFound(res)
    }

    // ?????????????????????
    const ImportSpider = require('../spiders/import/' + platform.name)

    // ??????????????????
    const spider = new ImportSpider(platform.name)

    // ????????????????????????
    const siteArticles = req.body

    // ????????????
    await spider.import(siteArticles)

    // ????????????
    await Result.success(res)
    return;
  };
const checkPlatformCookieStatus = async (req, res) => {
  const userId = req.user._id;
  const platforms = await Platform.find()
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i]
    const Spider = require(`../spiders/${platform.name}`) as typeof BaseSpider
    try {
      await Spider.checkCookieStatus(platform, userId)
    } catch (e) {
      logger.error(e)
    }
  }
  await Result.success(res)
  return;
};

router.get('/', getPlatformList)
router.get('/:id', getPlatform)
router.put('/', addPlatform)
router.post('/checkCookies', checkPlatformCookieStatus)
router.post('/:id', editPlatform)
router.delete('/:id', deletePlatform)
router.get('/:id/articles', getPlatformArticles)
router.post('/:id/articles', importPlatformArticles)

export = { router, basePath: '/platforms', };
