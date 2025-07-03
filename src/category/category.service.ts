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

    async findall() {
        return await CategoryModel.find()
    }

    async findById(id: string) {
        return await CategoryModel.findOne({ _id: id })
    }

    async deleteById(id: string) {
        return await CategoryModel.findByIdAndDelete(id)
    }

    async updateById(id: string, updateData: Partial<Category>) {
        return await CategoryModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
    }
}
