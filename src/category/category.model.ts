import mongoose, { Schema } from 'mongoose'
import { Category, PriceConfiguration, Attribute } from './category.types'

const priceConfigurationSchema = new Schema<PriceConfiguration>({
    priceType: {
        type: String,
        enum: ['base', 'additonal'],
    },
    availableOptions: {
        type: [String],
        required: [true, ' Price configuration available options are required'],
    },
})

const attributeSchema = new Schema<Attribute>({
    name: {
        type: String,
        required: [true, ' Attribute name is required'],
    },

    widgetType: {
        type: String,
        enum: ['switch', 'radio'],
    },

    defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, ' Attribute default value is required'],
    },

    availableOptions: {
        type: [String],
        required: [true, ' Attribute available options are required'],
    },
})

const categorySchema = new Schema<Category>({
    name: {
        type: String,
        required: [true, ' Category name is required'],
    },
    priceConfiguration: {
        type: Map,
        of: priceConfigurationSchema,
        required: [true, ' Price configuration is required'],
    },

    attributes: {
        type: [attributeSchema],
        required: [true, ' Attributes are required'],
    },
})

export default mongoose.model<Category>('Category', categorySchema)
