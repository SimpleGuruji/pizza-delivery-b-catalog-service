import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Category } from './category.types'
import { CategoryService } from './category.service'
import { Logger } from 'winston'
import { isValidObjectId } from 'mongoose'
import createHttpError from 'http-errors'

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this)
        this.create = this.create.bind(this)
        this.getOne = this.getOne.bind(this)
        this.getAll = this.getAll.bind(this)
        this.update = this.update.bind(this)
        this.delete = this.delete.bind(this)
    }
     
    async create(req: Request, res: Response, next: NextFunction) {
        const validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            return next(
                createHttpError(400, validationErrors.array()[0].msg as string),
            )
        }

        const { name, priceConfiguration, attributes } = req.body as Category

        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        })

        this.logger.info('Category created successfully', { id: category._id })

        res.json({ id: category._id })
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params

        if (!isValidObjectId(categoryId)) {
            const error = createHttpError(400, 'Invalid category id')
            return next(error)
        }

        const category = await this.categoryService.findById(categoryId)

        this.logger.info('Category fetched successfully', category)

        res.json(category)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getAll(req: Request, res: Response, next: NextFunction) {
        const categories = await this.categoryService.findall()

        res.json(categories)
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params

        if (!isValidObjectId(categoryId)) {
            const error = createHttpError(400, 'Invalid category id')
            return next(error)
        }

        const result = await this.categoryService.deleteById(categoryId)

        if (!result) {
            const error = createHttpError(
                404,
                'Category not found or already deleted',
            )
            return next(error)
        }

        this.logger.info('Category deleted successfully', { id: categoryId })

        res.json({ message: 'Successfully deleted the category' })
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params

        if (!isValidObjectId(categoryId)) {
            const error = createHttpError(400, 'Invalid category id')
            return next(error)
        }

        const updatedCategory = await this.categoryService.updateById(
            categoryId,
            req.body as Category,
        )

        res.json(updatedCategory)
    }
}
