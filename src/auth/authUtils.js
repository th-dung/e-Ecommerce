'use strict'

const JWT = require('jsonwebtoken');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const asyncHandler = require('../helpers/asyncHandler');

// service
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
      API_KEY : 'x-api-key',
      CLIENT_ID: 'x-client-id',
      AUTHORIZATION : 'authorization',
      REFRESHTOKEN: 'x-rtoken-id'
}

const createtokenPair = async (payload, publicKey, privateKey) => {
      try {
            // Access Token
            const accessToken = await JWT.sign(payload, publicKey, {
                  expiresIn: '2 days'
            });
            // Refresh Token
            const refreshToken = await JWT.sign(payload, privateKey, {
                  expiresIn: '7 days'
            });

            // verify access Token
            JWT.verify(accessToken, publicKey, (err, decode) => {
                  if (err) {
                        console.error('error verify', err);
                  } else {
                        console.log('decode verify', decode);
                  }
            });

            return { accessToken, refreshToken }
            
      } catch (error) {
            
      }
}

const authenticationv2 = asyncHandler( async (req, res, next) => {
      // 1 - check userId missing
      const userId = req.headers[HEADER.CLIENT_ID];
      if (!userId) throw new AuthFailureError('Invalid request');

      // 2 - get AccessToken
      const keyStore = await findByUserId(userId);
      if (!keyStore) throw new NotFoundError('Not found keystore');

      // 3 - verify Token
      if (req.headers[HEADER.REFRESHTOKEN]) {
            try {
                  const refreshToken = req.headers[HEADER.REFRESHTOKEN];
                  const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
                  if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userid');
                  // Check keyStore with this userId
                  req.keyStore = keyStore;
                  req.user = decodeUser;
                  req.refreshToken = refreshToken;
                  return next();
            } catch (error) {
                  throw error;
            }
      }

      const accessToken = req.headers[HEADER.AUTHORIZATION];
      if (!accessToken) throw new AuthFailureError('Invalid request');

      try {
            const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userid');
            req.keyStore = keyStore;
            req.user = decodeUser;
            return next()
      } catch (error) {
            throw error;
      }
});



const verifyJWT = async (token, keySecret) => {
      return await JWT.verify(token, keySecret)
}

module.exports = {
      createtokenPair,
      authenticationv2,
      verifyJWT
}