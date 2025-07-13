import { body } from 'express-validator'

export default [
    body('name')
        .exists()
        .withMessage('Topping name is required')
        .isString()
        .withMessage('Topping name must be a string'),

    body('price').exists().withMessage('Topping price is required'),

    body('tenantId').exists().withMessage('Tenant ID is required'),

    body('isPublish').optional(),
]
