import createHttpError from 'http-errors'
import { Filter, PaginateQuery, Product } from './poduct.types'
import productModel from './product.model'
import { paginationLabels } from '../config/pagination'

export class ProductService {
    async create(product: Product) {
        return await productModel.create(product)
    }

    async update(productId: string, product: Product) {
        if (!productId) {
            throw createHttpError(400, 'Product ID is required')
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            { _id: productId },
            { $set: product },
            { new: true },
        )

        if (!updatedProduct) {
            throw createHttpError(404, 'Product not found')
        }

        return updatedProduct
    }

    async getProductById(productId: string) {
        if (!productId) {
            throw createHttpError(400, 'Product ID is required')
        }

        const product = await productModel.findById(productId)

        return product
    }

    async getProducts(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
        const searchQueryRegex = new RegExp(q, 'i')

        const matchQuery = {
            ...filters,
            name: searchQueryRegex,
        }

        const aggregate = productModel.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true, // <-- This is the key!
                },
            },
        ])

        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        })
    }

    async delete(productId: string) {
        if (!productId) {
            throw createHttpError(400, 'Product ID is required')
        }

        await productModel.findByIdAndDelete(productId)
    }
}
