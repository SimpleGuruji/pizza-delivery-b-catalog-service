import { ToppingService } from './topping.service'
import { Logger } from 'winston'
import {
    CreateToppingBody,
    CreateToppingRequest,
    Topping,
    UpdateToppingBody,
    UpdateToppingRequest,
} from './topping.types'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { UploadedFile } from 'express-fileupload'
import { v4 as uuid } from 'uuid'
import createHttpError from 'http-errors'
import { CloudinaryStorage } from '../common/services/cloudinary'
import { isValidObjectId } from 'mongoose'
import { AuthRequest } from '../common/types'
import { MessageProducerBroker } from '../common/types/broker'

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private cloudinaryStorage: CloudinaryStorage,
        private logger: Logger,
        private broker: MessageProducerBroker,
    ) {}

    create = async (
        req: CreateToppingRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            return next(
                createHttpError(400, validationErrors.array()[0].msg as string),
            )
        }

        const image = req.files?.image as UploadedFile

        if (!image) {
            return next(createHttpError(400, 'Image is required'))
        }

        const imageName = uuid()

        await this.cloudinaryStorage.upload({
            filename: imageName,
            fileData: image.data,
        })

        const { name, price, tenantId, isPublish }: CreateToppingBody = req.body

        const topping = {
            name,
            price: Number(price),
            tenantId,
            isPublish,
            image: imageName,
        }

        const newTopping = await this.toppingService.create(topping as Topping)

        await this.broker.sendMessage(
            'topping',
            JSON.stringify({
                id: newTopping._id,
                price: newTopping.price,
            }),
        )

        res.status(201).json({
            id: newTopping._id,
        })
    }

    update = async (
        req: UpdateToppingRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            return next(
                createHttpError(400, validationErrors.array()[0].msg as string),
            )
        }

        const { toppingId } = req.params

        if (!isValidObjectId(toppingId)) {
            return next(createHttpError(400, 'Invalid topping ID'))
        }

        const existingTopping =
            await this.toppingService.getToppingById(toppingId)

        if (!existingTopping) {
            return next(createHttpError(404, 'Topping not found'))
        }

        if ((req as AuthRequest).auth.role !== 'admin') {
            const tenant = (req as AuthRequest).auth.tenant

            if (existingTopping.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        'You are not allowed to access this topping',
                    ),
                )
            }
        }

        const oldImage = existingTopping.image

        let newImage: string | undefined
        let uploadedNewImage = false

        if (req.files?.image) {
            newImage = uuid()

            await this.cloudinaryStorage.upload({
                filename: newImage,
                fileData: (req.files?.image as UploadedFile).data,
            })

            uploadedNewImage = true
        }

        const { name, price, tenantId, isPublish }: UpdateToppingBody = req.body

        const updatedTopping = await this.toppingService.update(toppingId, {
            name,
            price: Number(price),
            tenantId,
            isPublish,
            image: uploadedNewImage ? newImage : oldImage,
        } as Topping)

        if (uploadedNewImage && oldImage !== updatedTopping?.image) {
            try {
                await this.cloudinaryStorage.delete(oldImage)
            } catch (deleteError) {
                this.logger.error('Failed to delete old image:', deleteError)
                // Don't return error here as the product update was successful
            }
        }

        await this.broker.sendMessage(
            'topping',
            JSON.stringify({
                id: updatedTopping?._id,
                price: updatedTopping?.price,
            }),
        )

        res.json({ id: updatedTopping?._id })
    }

    getSingleTopping = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { toppingId } = req.params

        if (!isValidObjectId(toppingId)) {
            return next(createHttpError(400, 'Invalid topping ID'))
        }

        const topping = await this.toppingService.getToppingById(toppingId)

        if (!topping) {
            return next(createHttpError(404, 'Topping not found'))
        }

        res.json(topping)
    }

    getAllToppings = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const toppings = await this.toppingService.getAllToppings()

        if (!toppings) {
            return next(createHttpError(404, 'Toppings not found'))
        }

        res.json(toppings)
    }

    deleteTopping = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params

        if (!isValidObjectId(toppingId)) {
            return next(createHttpError(400, 'Invalid topping ID'))
        }

        await this.toppingService.delete(toppingId)

        res.json({ id: toppingId })
    }
}
