'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'Discounts';

const discountSchema = new Schema({
      discount_name: { type: String, require: true },
      discount_description: { type: String, require: true },
      discount_type: { type: String, default: 'fixed_amount' }, // percentage %
      discount_value: { type: Number, require: true }, // gia tri discount
      discount_code: { type: String, require: true }, // discount code
      discount_start_date: { type: Date, require: true }, // ngay bat dau
      discount_end_date: { type: Date, require: true }, // ngay ket thuc
      discount_max_uses: { type: Number, require: true }, // so luong discount ap dung
      discount_uses_count: { type: Number, require: true }, // so discount da su dung
      discount_users_used: { type: Array, default: [] }, // user da su dung
      discount_max_uses_per_users: { type: Number, require: true }, // sl discount toi da cua user
      discount_min_order_value: { type: Number, require: true },  
      discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
      discount_is_active: { type: Boolean, default: true }, // trang thai
      discount_applies_to: { type: String, require: true, enum: ['all', 'specific'] },
      discount_product_ids: { type: Array, default: [] } // So san pham ap dung
}, {
      timestamps: true,
      collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, discountSchema);