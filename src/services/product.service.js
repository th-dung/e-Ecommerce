'use strict'

const { product, clothing, electronic } = require('../models/product.model');
const { BadRequestError, ForbiddenError } = require('../core/error.response');

// Define factory class to create product 
class ProductFactory{
      // type: Clothing or Electronic
      static async createProduct(type, payload) {
            switch (type) {
                  case 'Clothing':
                        return new Clothing(payload).createProduct();
                  case 'Electronic':
                        return new Electronic(payload).createProduct();
                  default:
                        throw new BadRequestError(`Invalid product type ${type}`);
            }
      }
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
            return await product.create({ ...this, _id: product_id});
      }
}

// Define sub-class for fifferent product type Clothing
class Clothing extends Product{
      async createProduct() {
            const newClothing = await clothing.create(this.product_attributes)
            if (!newClothing) throw BadRequestError('Create new Clothong error');

            const newProduct = await super.createProduct()
            if (!newProduct) throw BadRequestError('Create new Product error');

            return newProduct;
      }
}

// Define sub-class for fifferent product type Electronic
class Electronic extends Product{
      async createProduct() {
            const newElectronic = await electronic.create({
                  ...this.product_attributes, 
                  product_shop: this.product_shop
            })
            if (!newElectronic) throw BadRequestError('Create new Clothong error');

            const newProduct = await super.createProduct(newElectronic._id)
            if (!newProduct) throw BadRequestError('Create new Product error');

            return newProduct;
      }
}

module.exports = ProductFactory;