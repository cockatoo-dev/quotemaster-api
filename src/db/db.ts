import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import type { Context } from "hono";
import { Bindings } from "..";
import { count, eq, gte, max, sql } from "drizzle-orm";
import { quotes } from "./schema";

class db {
  private _db: DrizzleD1Database
  
  constructor (c: Context<{Bindings: Bindings}>) {
    if (c.env.CF_DB) {
      this._db = drizzle(c.env.CF_DB)
    } else {
      throw Error("Unvable to connect to DB")
    }
  }

  public async getQuotesStats () {
    const dbData = await this._db.select({
      count: count(),
      maxLikes: max(quotes.likes)
    })
    .from(quotes)
    return dbData[0]
  }

  public async getQuoteById (id: number) {
    const dbData = await this._db.select()
    .from(quotes)
    .where(eq(quotes.id, id))
    return dbData
  }

  public async getAllQuotes () {
    const dbData = await this._db.select().from(quotes)
    return dbData
  }

  public async getQuotesWithLikes (likes: number) {
    const dbData = await this._db.select()
    .from(quotes)
    .where(gte(quotes.likes, likes))
    return dbData
  }

  public async newQuote (name: string, quote: string) {
    const dbData = await this._db.insert(quotes)
    .values({name, quote})
    .returning({id: quotes.id})
    return dbData[0]
  }

  public async likeQuote (id: number) {
    await this._db.update(quotes)
    .set({likes: sql`${quotes.likes} + 1`})
    .where(eq(quotes.id, id))
  }
}

let dbInstance: db | undefined = undefined

export const useDB = (c: Context<{Bindings: Bindings}>) => {
  if (!dbInstance) {
    dbInstance = new db(c)
  }
  return dbInstance
}
