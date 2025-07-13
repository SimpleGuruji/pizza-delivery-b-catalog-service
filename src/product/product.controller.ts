import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { v4 as uuid } from 'uuid'
import { ProductService } from './product.service'
import {
    CreateProductBody,
    CreateProductRequest,
    Filter,
    Product,
    UpdateProductBody,
    UpdateProductRequest,
} from './poduct.types'
import { CloudinaryStorage } from '../common/services/cloudinary'
import createHttpError from 'http-errors'
import mongoose, { isValidObjectId } from 'mongoose'
import { AuthRequest } from '../common/types'
import { UploadedFile } from 'express-fileupload'
import { Logger } from 'winston'

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: CloudinaryStorage,
        private logger: Logger,
    ) {}

    create = async (
        req: CreateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string))
        }

        const image = req.files!.image as UploadedFile
        const imageName = uuid()

        await this.storage.upload({
            filename: imageName,
            fileData: image.data,
        })

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        }: CreateProductBody = req.body

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            image: imageName,
        }

        const newProduct = await this.productService.create(product as Product)

        res.status(201).json({
            id: newProduct._id,
        })
    }

    update = async (
        req: UpdateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() })
        }

        const { productId } = req.params

        if (!isValidObjectId(productId)) {
            return next(createHttpError(400, 'Invalid product ID'))
        }

        const existingProduct =
            await this.productService.getProductById(productId)

        if (!existingProduct) {
            return next(createHttpError(404, 'Product not found'))
        }

        if ((req as AuthRequest).auth.role !== 'admin') {
            const tenant = (req as AuthRequest).auth.tenant

            if (existingProduct.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        'You are not allowed to access this product',
                    ),
                )
            }
        }

        const oldImage = existingProduct.image

        let newImage: string | undefined
        let uploadedNewImage = false

        try {
            if (req.files?.image) {
                newImage = uuid()

                const newImageData = req.files?.image as UploadedFile

                await this.storage.upload({
                    filename: newImage,
                    fileData: newImageData.data,
                })

                uploadedNewImage = true
            }

            const {
                name,
                description,
                priceConfiguration,
                attributes,
                tenantId,
                categoryId,
                isPublish,
            }: UpdateProductBody = req.body

            const updatedProduct = await this.productService.update(productId, {
                name,
                description,
                image: uploadedNewImage ? newImage : oldImage,
                categoryId,
                priceConfiguration: JSON.parse(
                    priceConfiguration,
                ) as Product['priceConfiguration'],
                attributes: JSON.parse(attributes) as Product['attributes'],
                tenantId,
                isPublish,
            } as Product)

            if (uploadedNewImage && oldImage !== updatedProduct.image) {
                try {
                    await this.storage.delete(oldImage)
                } catch (deleteError) {
                    this.logger.error(
                        'Failed to delete old image:',
                        deleteError,
                    )
                    // Don't return error here as the product update was successful
                }
            }

            res.json({
                id: productId,
                product: updatedProduct,
                message: 'Product updated successfully',
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Cleanup: If we uploaded a new image but failed to update the database,
            // we should delete the uploaded image to avoid orphaned files
            if (uploadedNewImage && newImage) {
                try {
                    await this.storage.delete(newImage)
                } catch (cleanupError) {
                    this.logger.error(
                        ' Failed to cleanup uploaded image:',
                        cleanupError,
                    )
                }
            }

            return next(createHttpError(500, 'Failed to update product'))
        }
    }

    index = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { q, tenantId, categoryId, isPublish } = req.query

            const filters: Filter = {}

            if (isPublish === 'true') {
                filters.isPublish = true
            }

            if (tenantId) {
                filters.tenantId = tenantId as string
            }

            if (categoryId && isValidObjectId(categoryId)) {
                filters.categoryId = new mongoose.Types.ObjectId(
                    categoryId as string,
                )
            }

            const search = typeof q === 'string' ? q.trim() : ''

            this.logger.info(`Filters: ${JSON.stringify(filters)}`)

            const products = await this.productService.getProducts(
                search,
                filters,
                {
                    page: parseInt(req.query.page as string) || 1,
                    limit: parseInt(req.query.limit as string) || 10,
                },
            )

            console.log(products)

            const finalProducts = (products.data as Product[]).map(
                (product) => {
                    return {
                        ...product,
                        image: this.storage.getObjectUri(product.image),
                    }
                },
            )

            res.json({
                data: finalProducts,
                total: products.total,
                pageSize: products.pageSize,
                currentPage: products.currentPage,
            })
        } catch (error) {
            next(error)
        }
    }

    getSingleProduct = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { productId } = req.params

        if (!isValidObjectId(productId)) {
            return next(createHttpError(400, 'Invalid product ID'))
        }

        const product = await this.productService.getProductById(productId)

        if (!product) {
            return next(createHttpError(404, 'Product not found'))
        }

        res.json(product)
    }

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params

        if (!isValidObjectId(productId)) {
            return next(createHttpError(400, 'Invalid product ID'))
        }

        const product = await this.productService.getProductById(productId)

        if (!product) {
            return next(createHttpError(404, 'Product not found'))
        }

        console.log((req as AuthRequest).auth)

        if ((req as AuthRequest).auth.role !== 'admin') {
            const tenant = (req as AuthRequest).auth.tenant

            if (product.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        'You are not allowed to access this product',
                    ),
                )
            }
        }

        await this.productService.delete(productId)

        try {
            await this.storage.delete(product.image)
        } catch (error) {
            this.logger.error('Failed to delete image:', error)
        }

        res.json({
            id: productId,
        })
    }
}
