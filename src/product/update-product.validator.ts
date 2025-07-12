import { body } from 'express-validator'

export default [
    body('name')
        .exists()
        .withMessage('Product name is required')
        .isString()
        .withMessage('Product name must be a string'),

    body('description').exists().withMessage('Product description is required'),

    body('priceConfiguration')
        .exists()
        .withMessage('Price configuration is required'),

    body('attributes').exists().withMessage('Product attributes is required'),

    body('tenantId')
        .exists()
        .withMessage('Tenant ID is required')
        .isInt()
        .withMessage('Tenant ID must be an integer'),

    body('categoryId').exists().withMessage('Category ID is required'),

    // body('image')
    //     .optional()
    //     .custom((_, { req }) => {
    //         if (!req.file) {
    //             throw new Error('Product image is required')
    //         }
    //         return true
    //     }),

    body('isPublish')
        .optional()
        .isBoolean()
        .withMessage('Is publish must be a boolean'),
]
