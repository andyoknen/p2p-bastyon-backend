import type { NextFunction, Request, Response } from 'express'
import { getPocketNetProxyInstance } from '../lib'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { signature } = req.body

    if (!signature) {
      return res.status(400).json({ message: 'Signature is required' })
    }

    const proxyInstance = await getPocketNetProxyInstance()
    const isValid = await proxyInstance.authorization.checkSignature({ signature })

    if (!isValid) {
      return res.status(403).json({ message: 'Invalid signature' })
    }

    next()
  }
  catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
