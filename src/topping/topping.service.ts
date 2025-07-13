import { Topping } from './topping.types'
import ToppingModel from './topping.model'
import createHttpError from 'http-errors'

export class ToppingService {
    async create(topping: Topping) {
        if (!topping) {
            throw createHttpError(400, 'Topping is required')
        }
        return await ToppingModel.create(topping)
    }

    async update(toppingId: string, topping: Topping) {
        if (!toppingId) {
            throw createHttpError(400, 'Topping ID is required')
        }

        return await ToppingModel.findByIdAndUpdate(toppingId, topping, {
            new: true,
        })
    }

    async delete(toppingId: string) {
        if (!toppingId) {
            throw createHttpError(400, 'Topping ID is required')
        }

        const topping = await this.getToppingById(toppingId)

        if (!topping) {
            throw createHttpError(404, 'Topping not found')
        }

        await ToppingModel.deleteOne({ _id: topping._id })
    }

    async getToppingById(toppingId: string) {
        if (!toppingId) {
            throw createHttpError(400, 'Topping ID is required')
        }

        return await ToppingModel.findById(toppingId)
    }

    async getAllToppings() {
        return await ToppingModel.find()
    }
}
