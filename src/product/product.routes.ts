import { Router } from 'express'
import fileUpload from 'express-fileupload'

import authenticate from '../common/middlewares/authenticate'

import { ProductController } from './product.controller'
import createProductValidator from './create-product.validator'
import { asyncWrapper } from '../common/utils/asyncWrapper'
import { ProductService } from './product.service'
import { CloudinaryStorage } from '../common/services/cloudinary'
import { canAccessAdminOrManager } from '../common/middlewares/canAccessAdminOrManager'
import updateProductValidator from './update-product.validator'
import createHttpError from 'http-errors'

const router = Router()

const productService = new ProductService()
const cloudinaryStorage = new CloudinaryStorage()
const productController = new ProductController(
    productService,
    cloudinaryStorage,
)

router.post(
    '/',
    authenticate,
    canAccessAdminOrManager,
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, 'File size exceeds the limit')
            next(error)
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
)

router.put(
    '/:productId',
    authenticate,
    canAccessAdminOrManager,
    fileUpload({
        limits: { fileSize: 500 * 1024 }, // 500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, 'File size exceeds the limit')
            next(error)
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
)

router.get(
    '/',

    asyncWrapper(productController.index),
)

router.get('/:productId', asyncWrapper(productController.getSingleProduct))

router.delete(
    '/:productId',
    authenticate,
    canAccessAdminOrManager,
    asyncWrapper(productController.deleteProduct),
)

export default router
