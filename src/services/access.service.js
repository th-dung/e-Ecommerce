'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createtokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils/index');
const { findByEmail } = require('./shop.service');
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');

const RoleShop = {
      SHOP: 'SHOP',
      WRITER: 'WRITER',
      EDITOR: 'EDITOR',
      ADMIN: 'ADMIN'
}

class AccessService {

      // Check this token used
      static handleRefreshToken = async ({ keyStore, user, refreshToken }) => {

            const { userId, email } = user;
            if (keyStore.refreshTokensUsed.includes(refreshToken)) {
                  // Xoa tat ca token trong keyStore
                  await KeyTokenService.deleteKeyById(userId)
                  throw new ForbiddenError('Something wrong happend! please login')
            }

            if (keyStore.refreshToken !== refreshToken) 
            throw new AuthFailureError('Shop not register');

            const foundShop = await findByEmail({ email });
            if (!foundShop) throw new AuthFailureError('Shop not register');
            // create new accessToken vs refreshToken 
            const tokens = await createtokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);
            // Update Token
            await keyStore.update({
                  $set: {
                        refreshToken: tokens.refreshToken
                  },
                  $addToSet: {
                        refreshTokensUsed: refreshToken
                  }
            });

            return {
                  user,
                  tokens
            }
      }

      static logout = async(keyStore) => {
            const delKey = await KeyTokenService.removeKeyById(keyStore._id);
            console.log({delKey});
            return delKey;
      }      

      static login = async ({ email, password, refreshToken = null }) => {
            // 1 - Check email in dbs
            const foundShop = await findByEmail({ email });
            if (!foundShop) throw new BadRequestError('Shop not register!');

            // 2 - Match password
            const match = bcrypt.compare(password, foundShop.password);
            if (!match) throw new AuthFailureError('Authentication error!');

            // 3 - Create privateKey vs publicKey and save
            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            // 4 - Generate token
            const { _id: userId } = foundShop
            const tokens = await createtokenPair({ userId: foundShop._id, email}, publicKey, privateKey);
            await KeyTokenService.createKeyToken({
                  refreshToken: tokens.refreshToken,
                  publicKey,
                  privateKey,
                  userId
            })

            // 5 - Get data return login
            return {
                  metadata: {
                        shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
                        tokens
                  }
            }
      }

      static signUp = async ({name, email, password}) => {
            // 1- Check email
            const holderShop = await shopModel.findOne({ email }).lean() // find boot
            if (holderShop) {
                  throw new BadRequestError('Error: Shop already register!')
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                  name, email, password: passwordHash, roles: [RoleShop.SHOP]
            });

            if (newShop) {
                  // 2 - Create privateKey, publicKey
                  const privateKey = crypto.randomBytes(64).toString('hex');
                  const publicKey = crypto.randomBytes(64).toString('hex');

                  console.log('[Keys]',{ privateKey, publicKey }); // Save collection keyStore

                  const keyStore = await KeyTokenService.createKeyToken({
                        userId: newShop._id,
                        publicKey,
                        privateKey
                  });

                  if (!keyStore) {
                        return {
                              code: 'xxxx',
                              messsage: 'KeyStore error!'
                        }
                  }

                  // 3 - Created Token pair
                  const tokens = await createtokenPair({userId: newShop._id, email}, publicKey, privateKey);
                  console.log(`Created Token Success:::`, tokens);

                  return {
                        code: 201,
                        metadata: {
                              shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                              tokens
                        }
                  }
            }

            return {
                  code: 200,
                  metadata: null
            }
      }
}

module.exports = AccessService;