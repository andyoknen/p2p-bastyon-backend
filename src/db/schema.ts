import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const paymentDataTable = sqliteTable('payment_data', {
  id: int('id').primaryKey({ autoIncrement: true }),

  details: text('details').notNull(),

  minPkoin: int('min_pkoin').notNull(),
  maxPkoin: int('max_pkoin').notNull(),

  margin: real('margin').notNull(),

  userName: text('user_name').notNull(),
  avatar: text('avatar').notNull(),
  address: text('address').notNull(),
  completedOrders: int('completed_orders').notNull(),

  telegram: text('telegram').notNull(),
  transferTime: text('transfer_time').notNull(),

  orders: text('orders').notNull(),
})
