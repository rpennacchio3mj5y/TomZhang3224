import models from '../models';
import * as Result from '../utils/result'
import data from '../data'
import { Router } from 'express';
import {SECRET, TOKEN} from '../config'
const router = Router();
const passport = require('passport');
import jwt = require('jsonwebtoken');
const { User, Environment } = models;

const register = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    User.register({ username, email}, password, (err, user) => {
      if (err) {
        return Result.error(res, '注册失败')
      }

      //@ts-ignore
      const userEnvs = data.environments.map(t =>  ({...t, user: user._id}));
      Environment.insertMany(userEnvs)

      return Result.success(res)
    });
  };
const login = (req, res, next) => {


    const body = { username: req.user.username, id: req.user.id };
  const token = jwt.sign({ ...body }, SECRET, {
      expiresIn: '1d'
    })
    res.cookie(TOKEN, token, { maxAge: 60 * 60 * 24 * 1000, domain: req.hostname });

    return Result.success(res)

};

router.post('/login', passport.authenticate('local', {
    session: false,
    assignProperty: 'user',
    // failWithError: true,
}), login);
router.post('/signup', register)
export = { router, basePath: '/users', };


