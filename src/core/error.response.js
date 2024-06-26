'use strict'

const ReasonPhrases = require('../utils/httpStatusCode');

const StatusCode = {
      FORBIDDEN: 403,
      CONFLICT: 409
} 

const ReasonStatusCode = {
      FORBIDDEN: 'Bad request error',
      CONFLICT: 'conflict error'
}

class ErrorRespone extends Error {
      constructor(message, status) {
            super(message)
            this.status = status;
      }
}

class ConflictRequestError extends ErrorRespone {
      constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
            super(message, statusCode);
      }
}

class BadRequestError extends ErrorRespone {
      constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
            super(message, statusCode);
      }
}

class AuthFailureError extends ErrorRespone {
      constructor( message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCode.UNAUTHORIZED) {
            super(message, statusCode)
      }
}

class NotFoundError extends ErrorRespone {
      constructor( message = ReasonPhrases.NOT_FOUND, statusCode = StatusCode.NOT_FOUND) {
            super(message, statusCode)
      }
}

class ForbiddenError extends ErrorRespone {
      constructor( message = ReasonPhrases.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
            super(message, statusCode)
      }
}

module.exports = {
      ConflictRequestError,
      BadRequestError,
      AuthFailureError,
      NotFoundError,
      ForbiddenError
}