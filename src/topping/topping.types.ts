import { Request } from 'express'

export interface Topping {
    name: string
    price: number
    image: string
    tenantId: string
    isPublish?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface CreateToppingBody {
    name: string
    price: string
    tenantId: string
    isPublish?: boolean
}

export interface CreateToppingRequest extends Request {
    body: CreateToppingBody
}

export interface UpdateToppingBody {
    name: string
    price: string
    tenantId: string
    isPublish?: boolean
}

export interface UpdateToppingRequest extends Request {
    body: UpdateToppingBody
}
