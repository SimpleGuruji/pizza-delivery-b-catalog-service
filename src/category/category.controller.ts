import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Category } from './category.types'
import { CategoryService } from './category.service'
import { Logger } from 'winston'

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create(req: Request, res: Response, next: NextFunction) {
        const validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() })
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
}
