import { Router } from 'express'
import { asyncWrapper } from '../common/utils/asyncWrapper'
import { ToppingService } from './topping.service'
import { ToppingController } from './topping.controller'
import logger from '../config/logger'
import { CloudinaryStorage } from '../common/services/cloudinary'
import authenticate from '../common/middlewares/authenticate'
import { canAccessAdminOrManager } from '../common/middlewares/canAccessAdminOrManager'
import fileUpload from 'express-fileupload'
import createHttpError from 'http-errors'
import createToppingValidator from './create-topping.validator'
import updateToppingValidator from './update-topping.validator'

const router = Router()

const toppingService = new ToppingService()
const cloudinaryStorage = new CloudinaryStorage()
const toppingController = new ToppingController(
    toppingService,
    cloudinaryStorage,
    logger,
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
    createToppingValidator,
    asyncWrapper(toppingController.create),
)

router.get('/', asyncWrapper(toppingController.getAllToppings))

router.get('/:toppingId', asyncWrapper(toppingController.getSingleTopping))

router.put(
    '/:toppingId',
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
    updateToppingValidator,
    asyncWrapper(toppingController.update),
)

router.delete(
    '/:toppingId',
    authenticate,
    canAccessAdminOrManager,
    asyncWrapper(toppingController.deleteTopping),
)

export default router
