import express from 'express'
import cookieParser from 'cookie-parser'
import { globalErrorHandler } from './common/middlewares/globalErrorHandler'
import categoryRouter from './category/category.routes'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

app.use('/category', categoryRouter)
app.use(globalErrorHandler)

export default app
