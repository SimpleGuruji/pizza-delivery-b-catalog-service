import mongoose, { AggregatePaginateModel } from 'mongoose'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
import {
    AttributeValue,
    PriceConfigurationValue,
    Product,
} from './poduct.types'

const attributeValueSchema = new mongoose.Schema<AttributeValue>({
    name: {
        type: String,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
    },
})

const priceConfigurationSchema = new mongoose.Schema<PriceConfigurationValue>({
    priceType: {
        type: String,
        enum: ['base', 'aditional'],
    },
    availableOptions: {
        type: Map,
        of: Number,
    },
})

const productSchema = new mongoose.Schema<Product>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
        },
        attributes: [attributeValueSchema],
        tenantId: {
            type: String,
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        isPublish: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    { timestamps: true },
)

productSchema.plugin(aggregatePaginate)

export default mongoose.model<Product, AggregatePaginateModel<Product>>(
    'Product',
    productSchema,
)
