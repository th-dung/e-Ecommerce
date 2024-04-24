'use strict'

// !dmbg
const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shop'

// Declare the Schema of the mongo model
const shopSchema = new Schema({
      name: {
            type: String,
            trim: true,
            maxLength: 150
      },
      email: {
            type: String,
            unique: true,
            trim: true
      },
      password: {
            type: String,
            unique: true
      },
      status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive'
      },
      verify: {
            type: Schema.Types.Boolean,
            default: false
      },
      roles: {
            type: Array,
            default: []
      }
}, {
      timestamps: true,
      collection: COLLECTION_NAME
});

// Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);