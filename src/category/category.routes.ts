import { Router } from 'express'
import { CategoryController } from './category.controller'
import categoryValidator from './category.validator'
import { CategoryService } from './category.service'
import logger from '../config/logger'
import { asyncWrapper } from '../common/utils/asyncWrapper'
import authenticate from '../common/middlewares/authenticate'

const router = Router()

const categoryService = new CategoryService()

const categoryController = new CategoryController(categoryService, logger)

router.post(
    '/',
    authenticate,
    categoryValidator,
    asyncWrapper(categoryController.create),
)

export default router
