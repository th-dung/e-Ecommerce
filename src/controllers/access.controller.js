'use strict'

const AccessService = require("../services/access.service");
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class AccessController {

      handleRefreshToken = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Get token success',
                  metadata: await AccessService.handleRefreshToken({
                        user: req.user,
                        keyStore: req.keyStore,
                        refreshToken: req.refreshToken
                  })
            }).send(res);
      }

      logout = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Logout success',
                  status: 200,
                  metadata: await AccessService.logout(req.keyStore)
            }).send(res);
      }

      login = async (req, res, next) => {
            new SuccessResponse({
                  metadata: await AccessService.login(req.body)
            }).send(res);
      }

      signUp = async (req, res, next) => {
            new CREATED({
                  message: 'Registered Ok!',
                  metadata: await AccessService.signUp(req.body),
                  options: {
                        limit: 10
                  }
            }).send(res);
      }
}

module.exports = new AccessController();