export interface PriceConfiguration {
    [key: string]: {
        priceType: 'base' | 'additonal'
        availableOptions: string[]
    }
}

export interface Attribute {
    name: string
    widgetType: 'radio' | 'switch'
    defaultValue: string
    availableOptions: string[]
}

export interface Category {
    name: string
    priceConfiguration: PriceConfiguration
    attributes: Attribute[]
}
