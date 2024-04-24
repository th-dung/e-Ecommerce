'use strict'

// const ProductService = require('../services/product.service');
const ProductService_pro = require('../services/product.service.pro');
const { SuccessResponse } = require('../core/success.response');

class ProductController{
      createProduct = async (req, res, next) => {
            // new SuccessResponse({
            //       message: 'Create new product success',
            //       metadata: await ProductService.createProduct(req.body.product_type, {
            //             ...req.body,
            //             product_shop: req.user.userId
            //       })
            // }).send(res);

            new SuccessResponse({
                  message: 'Create new product success',
                  metadata: await ProductService_pro.createProduct(req.body.product_type, {
                        ...req.body,
                        product_shop: req.user.userId
                  })
            }).send(res);
      }

      // Update product
      updateProduct = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Update product success',
                  metadata: await ProductService_pro.updateProduct(req.body.product_type, req.params.productId, {
                        ...req.body,
                        product_shop: req.user.userId
                  })
            }).send(res);
      }

      // On prooduct
      publishProductByShop = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Publish product success',
                  metadata: await ProductService_pro.publishProductByShop({
                        product_id: req.params.id,
                        product_shop: req.user.userId
                  })
            }).send(res);
      }

      // Off product
      unpublishProductByShop = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Unpublish product success',
                  metadata: await ProductService_pro.unpublishProductByShop({
                        product_id: req.params.id,
                        product_shop: req.user.userId
                  })
            }).send(res);
      }

      // Queyry
      /**
       * @desc Get all Drafts for shop
       * @param {Number} limit
       * @param {Number} skip 
       * @return { JSON } 
       */
      getAllDraftsForShop = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Get List Draft success',
                  metadata: await ProductService_pro.findAllDraftsForShop({
                        product_shop: req.user.userId
                  })
            }).send(res);
      }

      getAllPublishForShop = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Get List publish success',
                  metadata: await ProductService_pro.findAllPublishForShop({
                        product_shop: req.user.userId
                  })
            }).send(res);
      }

      getListSearchProduct = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Get list search product success',
                  metadata: await ProductService_pro.searchProducts(req.params)
            }).send(res)
      }

      findAllProduct = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Get list all product success',
                  metadata: await ProductService_pro.findAllProduct(req.query)
            }).send(res);
      }

      findOneProduct = async (req, res, next) => {
            new SuccessResponse({
                  message: 'Get list all product success',
                  metadata: await ProductService_pro.findProduct({
                        product_id: req.params.product_id
                  })
            }).send(res);
      }
      // End Queyry
}

module.exports = new ProductController;