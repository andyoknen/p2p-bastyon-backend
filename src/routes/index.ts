import { Router } from 'express'
import * as controller from '../controllers/index'
import { authMiddleware } from '../middlewares/auth'

export const index = Router()

index.post('/add-payment', authMiddleware, controller.addPayment)
index.get('/payments', controller.getAllPayments)
index.get('/payments/:id', controller.getPaymentById)
index.post('/payments/:paymentId/add-order', authMiddleware, controller.addOrder)
index.patch('/payments/:paymentId/orders/:orderId/status', authMiddleware, controller.updateOrderStatus)
index.get('/payments/:paymentId/orders/:orderId', controller.getOrderById)
index.get('/payments/:paymentId/orders', controller.getOrdersByPaymentId)
index.get('/payments/address/me', authMiddleware, controller.getPaymentByAddress)
