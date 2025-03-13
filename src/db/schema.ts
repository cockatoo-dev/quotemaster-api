import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const quotes = sqliteTable('quotes', {
  id: integer('id').primaryKey({autoIncrement: true}),
  name: text('name').notNull(),
  quote: text('quote').notNull(),
  likes: integer('likes').notNull().default(0)
})
