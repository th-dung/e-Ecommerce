'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const { removeUnderfineObject, updateNestedObjectParser } = require('../utils/index');
const { findAllDraftsForShop, 
      publishProductByShop, 
      findAllPublishForShop,
      unpublishProductByShop,
      searchProductByUser,
      findAllProducts,
      findProduct,
      updateProductById
      } = require('../models/repositories/product.repo');
const { insertInventory } = require('../models/repositories/invensory.repo');      

// Define factory class to create product 
class ProductFactory{
      
      static productRegistry = {} // Key-class

      static registerProductType(type, classRef) {
            ProductFactory.productRegistry[type] = classRef;
      }

      // Create product
      static async createProduct(type, payload) {
            const productClass = ProductFactory.productRegistry[type]
            if (!productClass) throw new BadRequestError(`Invalid product type ${type}`);

            return new productClass(payload).createProduct();
      }

      // Update product
      static async updateProduct(type, productId, payload) {
            const productClass = ProductFactory.productRegistry[type];
            if (!productClass) throw new BadRequestError(`Invalid product type ${type}`)

            return new productClass(payload).updateProduct(productId);
      }

      // PUT 
      static async publishProductByShop({ product_shop, product_id }) {
            return await publishProductByShop({ product_shop, product_id });
      }

      static async unpublishProductByShop({ product_shop, product_id }) {
            return await unpublishProductByShop({ product_shop, product_id });
      }
      // End PUT

      // Queyry

      // find all Draft
      static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0}) {
            const query = { product_shop, isDraft: true }
            return await findAllDraftsForShop({ query, limit, skip });
      }

      // Find all publish product for shop
      static async findAllPublishForShop({ product_shop, limit = 50, skip = 0}) {
            const query = { product_shop, isPublished: true }
            return await findAllPublishForShop({ query, limit, skip });
      }

      // Search product
      static async searchProducts({ keySearch}) {
            return await searchProductByUser({ keySearch });
      }

      // find all publish product
      static async findAllProduct({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished : true } }) {
            return await findAllProducts({ limit, sort, filter, page, 
                  select: ['product_name', 'product_price', 'product_thumb']
            });
      }

      static async findProduct({ product_id }) {
            return await findProduct({ product_id, unSelect: ['__v', 'product_variations'] });
      }
      // End Queyry
}

// Define base product class
class Product{
      constructor({
            product_name,
            product_thumb,
            product_description,
            product_price,
            product_quantity,
            product_type,
            product_shop,
            product_attributes
      }) {
            this.product_name = product_name
            this.product_thumb = product_thumb
            this.product_description = product_description
            this.product_price = product_price
            this.product_quantity = product_quantity
            this.product_type = product_type
            this.product_shop = product_shop
            this.product_attributes = product_attributes
      }
      // Create new product
      async createProduct(product_id) {
            const newProduct =  await product.create({ ...this, _id: product_id });
            if (newProduct) {
                  // add product_stock in inventory collection
                  await insertInventory({
                        productId: newProduct._id,
                        shopId: this.product_shop,
                        stock: this.product_quantity
                  });
            }

            return newProduct;
      }

      // Update product
      async updateProduct(productId, bodyUpdate) {
            return await updateProductById({ productId, bodyUpdate, model: product });
      }
}

// Define sub-class for riferent product type Clothing
class Clothing extends Product{
      // Create
      async createProduct() {
            const newClothing = await clothing.create({
                  ...this.product_attributes,
                  product_shop: this.product_shop
            })
            if (!newClothing) throw BadRequestError('Create new Clothing error');

            const newProduct = await super.createProduct(newClothing._id)
            if (!newProduct) throw BadRequestError('Create new Product error');

            return newProduct;
      }

      // Update Product
      async updateProduct(productId) {
            // Remove attr has null underfine
            // console.log(`Before:::`, this)
            const updateNest = removeUnderfineObject(this);
            const objectParams = updateNestedObjectParser(updateNest);
            // console.log(`After:::`, objectParams)
            // Check where update
            if (objectParams.product_attributes) {
                  // update child
                  await updateProductById({ 
                        productId, 
                        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), 
                        model: clothing 
                  });
            }
            const updateProduct = await super.updateProduct(productId, objectParams);
            return updateProduct;
      }
}

// Define sub-class for fifferent product type Electronic
class Electronic extends Product{
      async createProduct() {
            const newElectronic = await electronic.create({
                  ...this.product_attributes, 
                  product_shop: this.product_shop
            })
            if (!newElectronic) throw BadRequestError('Create new Electronic error');

            const newProduct = await super.createProduct(newElectronic._id)
            if (!newProduct) throw BadRequestError('Create new Product error');

            return newProduct;
      }
}

// Define sub-class for fifferent product type Furniture
class Furniture extends Product{
      async createProduct() {
            const newFurniture = await furniture.create({
                  ...this.product_attributes, 
                  product_shop: this.product_shop
            })
            if (!newFurniture) throw BadRequestError('Create new Furniture error');

            const newProduct = await super.createProduct(newFurniture._id)
            if (!newProduct) throw BadRequestError('Create new Product error');

            return newProduct;
      }
}

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Furniture', Furniture);
// ProductFactory.registerProductType('more', class_more);

module.exports = ProductFactory;