import { Category } from './category.types'
import CategoryModel from './category.model'

export class CategoryService {
    async create({ name, priceConfiguration, attributes }: Category) {
        const category = new CategoryModel({
            name,
            priceConfiguration,
            attributes,
        })
        return await category.save()
    }
}
