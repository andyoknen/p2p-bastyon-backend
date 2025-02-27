import type { Request, Response } from 'express'
import type { RequestAuth } from 'request'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { db } from '../db'
import { paymentDataTable } from '../db/schema'
import { getPocketNetProxyInstance } from '../lib'
import { upload } from '../middlewares/multer'

function preprocessConvertToNumber(val: any) {
  if (typeof val === 'string' && !Number.isNaN(Number(val))) {
    return Number(val)
  }
  return val
}

const paymentDataSchema = z.object({
  details: z
    .array(
      z.object({
        currency: z.array(z.string()),
        paymentMethod: z.string(),
        language: z.string(),
        instructions: z.string(),
      }),
    )
    .nonempty(),
  minPkoin: z.number().positive(),
  maxPkoin: z.number().positive(),
  margin: z.number().positive(),
  telegram: z.string().min(1),
  transferTime: z.string().min(1),
})

export async function addPayment(req: RequestAuth, res: Response) {
  try {
    const { ...body } = req.body
    const validatedData = paymentDataSchema.parse(body)
    const proxyInstance = await getPocketNetProxyInstance()
    const profile = await proxyInstance.rpc.getuserprofile({
      addresses: [req.address],
    })

    const existingPayment = await db
      .select()
      .from(paymentDataTable)
      .where(eq(paymentDataTable.address, req.address))
      .limit(1)

    if (existingPayment.length > 0) {
      // ✅ Если уже есть платеж, обновляем его
      await db
        .update(paymentDataTable)
        .set({
          details: JSON.stringify(validatedData.details),
          minPkoin: validatedData.minPkoin,
          maxPkoin: validatedData.maxPkoin,
          margin: validatedData.margin,
          userName: profile.data[0].name,
          avatar: profile.data[0].i,
          telegram: validatedData.telegram,
          transferTime: validatedData.transferTime,
        })
        .where(eq(paymentDataTable.address, req.address))

      return res.status(200).json({ message: 'Payment data updated successfully' })
    }

    await db.insert(paymentDataTable).values({
      details: JSON.stringify(validatedData.details),
      minPkoin: validatedData.minPkoin,
      maxPkoin: validatedData.maxPkoin,
      margin: validatedData.margin,
      userName: profile.data[0].name,
      avatar: profile.data[0].i,
      address: profile.data[0].address,
      completedOrders: 0,
      orders: JSON.stringify([]),
      telegram: validatedData.telegram,
      transferTime: validatedData.transferTime,
    })

    res.status(201).json({ message: 'Payment data added successfully' })
  }
  catch (error) {
    console.error(error)

    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export async function getAllPayments(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { currency } = req.query
    const allPayments = await db.select().from(paymentDataTable)

    const filteredPayments = allPayments
      .map(payment => ({
        ...payment,
        details: JSON.parse(payment.details),
      }))
      .filter(payment =>
        currency
          ? payment.details.some((detail: { currency: string[] }) =>
              detail.currency.includes(currency as string),
            )
          : true,
      )

    res.status(200).json({
      message: 'Payments retrieved successfully',
      data: filteredPayments,
    })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve payments' })
  }
}

export async function getPaymentById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { currency } = req.query
    console.log(paymentDataTable.id, id)

    const payment = await db
      .select()
      .from(paymentDataTable)
      .where(eq(paymentDataTable.id, Number(id)))
      .limit(1)

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    const paymentDetails = {
      ...payment[0],
      details: JSON.parse(payment[0].details),
      orders: JSON.parse(payment[0].orders),
    }

    if (currency) {
      paymentDetails.details = paymentDetails.details.filter(
        (detail: { currency: string[] }) =>
          detail.currency.includes(currency as string),
      )
    }

    res.status(200).json({
      message: 'Payment retrieved successfully',
      data: paymentDetails,
    })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve payment details' })
  }
}

export async function getNodeInfo(req: Request, res: Response): Promise<void> {
  try {
    const pocketNetProxyInstance = await getPocketNetProxyInstance()
    const result = await pocketNetProxyInstance.rpc.getnodeinfo()

    res.status(200).json({
      message: 'Node information retrieved successfully',
      data: result,
    })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve node information' })
  }
}

const orderSchema = z.object({
  id: z.string().uuid().optional(),
  unitPrice: z.preprocess(preprocessConvertToNumber, z.number()),
  fiatPrice: z.preprocess(preprocessConvertToNumber, z.number()),
  fiatCurrency: z.string().min(1),
  paymentMethod: z.string().min(1),
  counterpartyAddress: z.string().min(1),
  currency: z.string().nonempty(),
  status: z.enum(['pending', 'paid', 'canceled']).default('pending'),
})
export const addOrder = [
  upload.single('paymentProof'),
  async (req: RequestAuth, res: Response) => {
    try {
      const { paymentId } = req.params
      const parsedData = {
        ...req.body,
        counterpartyAddress: req.address,
        id: uuidv4(),
        unitPrice: Number(req.body.unitPrice),
        currency: req.body.currency,
      }

      const validatedOrder = orderSchema.parse(parsedData)

      const paymentProof = req.file ? `/uploads/${req.file.filename}` : null

      const payment = await db
        .select()
        .from(paymentDataTable)
        .where(eq(paymentDataTable.id, Number(paymentId)))
        .limit(1)

      if (payment.length === 0) {
        return res.status(404).json({ message: 'Payment not found' })
      }

      const existingOrders = JSON.parse(payment[0].orders || '[]')

      const newOrder = {
        ...validatedOrder,
        paymentProof,
      }

      existingOrders.push(newOrder)

      await db
        .update(paymentDataTable)
        .set({ orders: JSON.stringify(existingOrders) })
        .where(eq(paymentDataTable.id, Number(paymentId)))

      res.status(201).json({ message: 'Order added successfully', order: { ...newOrder, paymentId: payment[0].id } })
    }
    catch (error) {
      console.error(error)
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors })
      }
      else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
]
const statusSchema = z.object({
  status: z.enum(['pending', 'paid', 'canceled']),
})

export async function updateOrderStatus(req: RequestAuth, res: Response) {
  try {
    const { paymentId, orderId } = req.params
    const { ...body } = req.body
    const { status } = statusSchema.parse(body)

    const payment = await db
      .select()
      .from(paymentDataTable)
      .where(eq(paymentDataTable.id, Number(paymentId)))
      .limit(1)

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    if (payment[0].address !== req.address) {
      return res.status(403).json({ message: 'Not access' })
    }

    const existingOrders = JSON.parse(payment[0].orders || '[]')

    const orderIndex = existingOrders.findIndex((order: any) => order.id === orderId)

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' })
    }

    existingOrders[orderIndex].status = status

    const completedOrders = existingOrders.reduce(
      (acc: number, order: any) => (order.status === 'paid' ? acc + 1 : acc),
      0,
    )

    await db
      .update(paymentDataTable)
      .set({ orders: JSON.stringify(existingOrders), completedOrders })
      .where(eq(paymentDataTable.id, Number(paymentId)))

    res.status(200).json({
      message: 'Order status updated successfully',
      order: existingOrders[orderIndex],
    })
  }
  catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
    }
    else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { paymentId, orderId } = req.params

    const payment = await db
      .select()
      .from(paymentDataTable)
      .where(eq(paymentDataTable.id, Number(paymentId)))
      .limit(1)

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    const existingOrders = JSON.parse(payment[0].orders || '[]')

    const order = existingOrders.find((order: any) => order.id === orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.status(200).json({
      message: 'Order retrieved successfully',
      order: { makerAddress: payment?.[0].address, ...order },
    })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve order' })
  }
}

export async function getOrdersByPaymentId(req: Request, res: Response) {
  try {
    const { paymentId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    if (page < 1 || limit < 1) {
      return res.status(400).json({ message: 'Invalid pagination parameters' })
    }

    const payment = await db
      .select()
      .from(paymentDataTable)
      .where(eq(paymentDataTable.id, Number(paymentId)))
      .limit(1)

    if (payment.length === 0) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    let existingOrders = JSON.parse(payment[0].orders || '[]')

    existingOrders.reverse()

    const totalOrders = existingOrders.length
    const totalPages = Math.ceil(totalOrders / limit)

    existingOrders = existingOrders.slice((page - 1) * limit, page * limit)

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders: existingOrders.map((order: any) => ({
        makerAddress: payment[0].address, // Добавляем адрес мейкера
        ...order,
      })),
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
      },
    })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve orders' })
  }
}

export async function getPaymentByAddress(req: RequestAuth, res: Response) {
  try {
    const address = req.address

    if (!address) {
      return res.status(400).json({ message: 'Address is required' })
    }

    const payment = await db
      .select()
      .from(paymentDataTable)
      .where(eq(paymentDataTable.address, address))
      .limit(1)

    if (payment.length === 0) {
      return res.status(200).json({ message: 'Payment not found', data: null })
    }

    const paymentDetails = {
      ...payment[0],
      details: JSON.parse(payment[0].details),
      orders: JSON.parse(payment[0].orders),
    }

    res.status(200).json({
      message: 'Payment retrieved successfully',
      data: paymentDetails,
    })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to retrieve payment details' })
  }
}
