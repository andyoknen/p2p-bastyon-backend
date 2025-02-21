import type { NextFunction, Request, Response } from 'express'
import type { RequestAuth } from 'request'
import { getPocketNetProxyInstance } from '../lib'

export async function authMiddleware(req: RequestAuth, res: Response, next: NextFunction) {
  try {
    const signature = JSON.parse(req.headers.signature as string)

    if (!signature) {
      return res.status(400).json({ message: 'Signature is required' })
    }

    const proxyInstance = await getPocketNetProxyInstance()
    console.log(signature, '|||')

    const isValid = await proxyInstance.authorization.checkSignature({ signature })
    console.log(isValid, 'dla')

    if (!isValid) {
      return res.status(403).json({ message: 'Invalid signature' })
    }
    req.address = signature.address
    next()
  }
  catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
