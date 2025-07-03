import { Router } from 'express'
import { CategoryController } from './category.controller'
import categoryValidator from './category.validator'
import { CategoryService } from './category.service'
import logger from '../config/logger'
import { asyncWrapper } from '../common/utils/asyncWrapper'
import authenticate from '../common/middlewares/authenticate'
import { canAccessAdmin } from '../common/middlewares/canAccessAdmin'

const router = Router()

const categoryService = new CategoryService()

const categoryController = new CategoryController(categoryService, logger)

router.post(
    '/',
    authenticate,
    canAccessAdmin,
    categoryValidator,
    asyncWrapper(categoryController.create),
)
router.get(
    '/:categoryId',

    asyncWrapper(categoryController.getOne),
)
router.get(
    '/',

    asyncWrapper(categoryController.getAll),
)
router.delete(
    '/:categoryId',
    authenticate,
    canAccessAdmin,

    asyncWrapper(categoryController.delete),
)
router.patch(
    '/:categoryId',
    authenticate,
    canAccessAdmin,
    categoryValidator,
    asyncWrapper(categoryController.update),
)

export default router
