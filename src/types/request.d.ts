import type { Request } from '@types/express'

export interface RequestAuth extends Request {
  address: string
}
