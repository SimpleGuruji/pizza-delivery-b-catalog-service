import { body } from 'express-validator'

export default [
    body('name')
        .exists()
        .withMessage('Category name is required')
        .isString()
        .withMessage('category name must be a string'),

    body('priceConfiguration')
        .exists()
        .withMessage('Price configuration is required'),

    body('priceConfiguration.*.priceType')
        .exists()
        .withMessage('Category price type is required')
        .custom((value: 'base' | 'aditional') => {
            const validKeys = ['base', 'aditional']
            if (!validKeys.includes(value)) {
                throw new Error(`Invalid category price type: ${value}.`)
            }
        }),

    body('attributes').exists().withMessage('Category attributes is required'),
]
