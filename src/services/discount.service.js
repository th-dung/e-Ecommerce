'use strict'

const discount = require('../models/discount.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { convertToObjectIMongodb } = require('../utils/index');
const { findAllProducts } = require('../models/repositories/product.repo');
const { findAllDiscountCodeUnSelect, findAllDiscountCodesSelect, checkDiscountExists } = require('../models/repositories/discount.repo');

/*
      Discount Service
      - Generator discount code [Shop | Admin]
      - Get discount amount [User]
      - Get all discount codes [User | Shop]
      - Verify discount code [User]
      - Delete discount code [ Adim | Shop]
      - Cancel discount code [User]
 */

class DiscountService {
      static async createDiscountCode(payload) {
            const {
                  code,
                  start_date,
                  end_date,
                  is_active,
                  shopId,
                  min_order_value,
                  product_ids,
                  applies_to,
                  name,
                  description,
                  type,
                  value,
                  users_used,
                  //max_value,
                  max_uses,
                  uses_count,
                  max_uses_per_user
            } = payload;

            // check
            // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            //       throw new BadRequestError('Discount code has expried');
            // }

            if (new Date(start_date) >= new Date(end_date)) {
                  throw new BadRequestError('Start date must be before end_date');
            }

            // Create index for discount code
            const foundDiscount = await discount.findOne({
                  discount_code: code,
                  discount_shopId: convertToObjectIMongodb(shopId)
            }).lean();

            if (foundDiscount && foundDiscount.discount_is_active) {
                  throw new BadRequestError('Discount expried');
            }

            const newDiscount = await discount.create({
                  discount_name: name,
                  discount_description: description,
                  discount_type: type,
                  discount_value: value, 
                  discount_code: code,
                  discount_start_date: new Date(start_date),
                  discount_end_date: new Date(end_date),
                  discount_max_uses: max_uses,
                  discount_uses_count: uses_count,
                  discount_users_used: users_used,
                  discount_max_uses_per_users: max_uses_per_user,
                  discount_min_order_value: min_order_value || 0,
                  discount_shopId: shopId,
                  discount_is_active: is_active,
                  discount_applies_to: applies_to,
                  discount_product_ids: applies_to === 'all' ? [] : product_ids
            });

            return newDiscount;
      }

      // Update discount
      static async updateDiscountCode() {

      }

      // Get all discount code available with product
      static async getAllDiscountCodeWithProduct({ code, shopId, userId, limit, page}) {
            // Create index for discount code
            const foundDiscount = await discount.findOne({
                  discount_code: code,
                  discount_shopId: convertToObjectIMongodb(shopId)
            }).lean();

            if (!foundDiscount || !foundDiscount.discount_is_active) {
                  throw new NotFoundError('Discount not exists!');
            }

            const { discount_applies_to, discount_product_ids } = foundDiscount;
            let products;
            if (discount_applies_to === 'all') {
                  // Get all product
                  products = await findAllProducts({
                        filter: {
                              product_shop: convertToObjectIMongodb(shopId),
                              isPublished: true
                        },
                        limit: +limit,
                        page: +page,
                        sort: 'ctime',
                        select: ['product_name']
                  });
            }

            if (discount_applies_to === 'specific') {
                  // Get the product ids
                  products = await findAllProducts({
                        filter: {
                              _id: {$in: discount_product_ids},
                              isPublished: true
                        },
                        limit: +limit,
                        page: +page,
                        sort: 'ctime',
                        select: ['product_name']
                  });
            }
            return products;
      }

      // Get all discount of shop
      static async getAllDiscountCodesByShop({ limit, page, shopId }) {
            const discounts = await findAllDiscountCodesSelect({
                  limit: +limit,
                  page: +page,
                  filter: {
                        discount_shopId: convertToObjectIMongodb(shopId),
                        discount_is_active: true
                  },
                  select: ['discount_code', 'discount_name'],
                  model: discount
            });

            return discounts;
      }

      static async getDiscountAmount({ codeId, userId, shopId, products }) {
            const foundDiscount = await checkDiscountExists({ 
                  model: discount, 
                  filter: {
                        discount_code: codeId,
                        discount_shopId: convertToObjectIMongodb(shopId)
                  }
            });

            if (!foundDiscount) throw new NotFoundError(`Discount doesn't exists`);
            const { 
                  discount_is_active, 
                  discount_max_uses,
                  discount_min_order_value,
                  discount_users_used,
                  discount_max_uses_per_users,
                  discount_type,
                  discount_value,
                  discount_start_date,
                  discount_end_date
            } = foundDiscount;

            if (!discount_is_active) throw new NotFoundError(`Discount expried`);
            if (!discount_max_uses) throw new NotFoundError(`Discount are out`);
            // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            //       throw new NotFoundError(`Discount code has expried`);
            // }

            // Check gia tri toi thieu
            let totalOrder = 0;
            if (discount_min_order_value > 0) {
                  // Get total
                  totalOrder = products.reduce((acc, product) => {
                        return acc + (product.quantity * product.price)
                  }, 0);

                  if (totalOrder < discount_min_order_value) {
                        throw new NotFoundError(`Discount requires a minium order value of ${discount_min_order_value}`);
                  }
            }

            if (discount_max_uses_per_users > 0) {
                  const userUserDiscount = discount_users_used.find(user => user.userId === userId);
                  if (userUserDiscount) {
                        // ...
                  }
            }

            // Check discount la fixed_amount
            const amount = discount_type === 'fixed_amount' ? discount_value: totalOrder * (discount_value / 100);

            return {
                  totalOrder,
                  discount: amount,
                  totalPrice: totalOrder - amount
            };
      }

      static async deleteDiscountCode({ shopId, codeId }) {
            const deleted = await discount.findOneAndDelete({
                  discount_code: codeId,
                  discount_shopId: convertToObjectIMongodb(shopId)
            });

            return deleted;
      }

      // Cancel discount code
      static async cancelDiscountCode({ codeId, shopId, userId }) {
            const foundDiscount = await checkDiscountExists({
                  model: discount,
                  filter: {
                        discount_code: codeId,
                        discount_shopId: shopId
                  }
            });

            if(!foundDiscount) throw new NotFoundError(`Discount doesn't exists`);

            const result = await discount.findByIdAndUpdate(foundDiscount._id, {
                  $pull: {
                        discount_users_used: userId
                  },
                  $inc: {     
                        discount_max_uses: 1,
                        discount_uses_count: -1
                  }
            });

            return result;
      }
}

module.exports = DiscountService;