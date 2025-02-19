import express from 'express'
import logger from 'morgan'

import { errorHandler, errorNotFoundHandler } from './middlewares/errorHandler'

// Routes
import { index } from './routes/index'

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import cors from 'cors'

export const app = express()
app.use(cors())

app.use(express.json()) // Нужно для парсинга JSON-тела
app.use(express.urlencoded({ extended: true }))
// Express configuration
app.set('port', process.env.PORT || 3000)

app.use(logger('dev'))

app.use('/', index)

app.use(errorNotFoundHandler)
app.use(errorHandler)
