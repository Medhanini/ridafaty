'use strict'

const ApiError = require('../utils/ApiError')

/**
 * Validates the request against a Joi schema.
 * On failure, forwards a 400 ApiError with all validation messages.
 *
 * @param {import('joi').ObjectSchema} schema  Joi schema for { body, query, params }
 *
 * @example
 *   router.post('/', validate(createUserSchema), UserController.create)
 */
function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(
      { body: req.body, query: req.query, params: req.params },
      { abortEarly: false, stripUnknown: true },
    )

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ')
      return next(ApiError.badRequest(messages))
    }

    // Replace req properties with the validated + stripped values
    req.body = value.body ?? req.body
    req.query = value.query ?? req.query
    req.params = value.params ?? req.params

    next()
  }
}

module.exports = validate
