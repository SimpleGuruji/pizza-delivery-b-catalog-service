import { Request } from 'express'
import mongoose from 'mongoose'

export type AttributeValue = {
    name: string
    value: string | number | boolean
}

export type PriceConfigurationValue = {
    priceType: 'base' | 'aditional'
    availableOptions: {
        [key: string]: number
    }
}

export interface Product {
    _id: mongoose.Types.ObjectId
    name: string
    description: string
    image: string
    priceConfiguration: {
        [key: string]: PriceConfigurationValue
    }
    attributes: AttributeValue[]
    tenantId: string
    categoryId: mongoose.Types.ObjectId | string
    isPublish?: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CreateProductBody {
    name: string
    description: string
    priceConfiguration: string
    attributes: string
    tenantId: string
    categoryId: mongoose.Types.ObjectId | string
    isPublish?: boolean
}

export interface CreateProductRequest extends Request {
    body: CreateProductBody
}

export interface UpdateProductBody {
    name: string
    description: string
    image?: string
    priceConfiguration: string
    attributes: string
    tenantId: string
    categoryId: mongoose.Types.ObjectId | string
    isPublish: boolean
}

export interface UpdateProductRequest extends Request {
    body: UpdateProductBody
}

export interface Filter {
    tenantId?: string
    categoryId?: mongoose.Types.ObjectId | string
    isPublish?: boolean
}

export interface PaginateQuery {
    limit: number
    page: number
}
