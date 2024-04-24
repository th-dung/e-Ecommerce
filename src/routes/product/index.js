'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationv2 } = require('../../auth/authUtils');

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct));
router.get('', asyncHandler(productController.findAllProduct));
router.get('/:product_id', asyncHandler(productController.findOneProduct));

// Authentication
router.use(authenticationv2);

router.post('/create', asyncHandler(productController.createProduct));
router.patch('/update/:productId', asyncHandler(productController.updateProduct));
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.post('/unpublish/:id', asyncHandler(productController.unpublishProductByShop));
// Queyry
router.get('/draft/all', asyncHandler(productController.getAllDraftsForShop));
router.get('/published/all', asyncHandler(productController.getAllPublishForShop));

module.exports = router;