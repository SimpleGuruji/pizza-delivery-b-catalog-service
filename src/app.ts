import express from 'express'
import cookieParser from 'cookie-parser'
import { globalErrorHandler } from './common/middlewares/globalErrorHandler'
import categoryRouter from './category/category.routes'
import productRouter from './product/product.routes'
import toppingRouter from './topping/topping.routes'

const app = express()
app.use(express.json())

app.use(cookieParser())
app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

app.use('/category', categoryRouter)
app.use('/products', productRouter)
app.use('/toppings', toppingRouter)
app.use(globalErrorHandler)

export default app
