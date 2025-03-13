import { Hono } from 'hono'
import { useDB } from './db/db'
import { z } from 'zod'
import { validator } from 'hono/validator'
import { cors } from 'hono/cors'

export type Bindings = {
  CF_DB: D1Database
}

const app = new Hono<{Bindings: Bindings}>()

app.use('/*', cors())

app.get('/handshake', (c) => {
  return c.body(null, 204)
})

app.get('/random', async (c) => {
  const db = useDB(c)
  const stats = await db.getQuotesStats()
  const randomId = Math.floor(Math.random() * stats.count) + 1
  const quote = await db.getQuoteById(randomId)
  return c.json(quote[0])
})

app.get('/popular', async (c) => {
  const db = useDB(c)
  const stats = await db.getQuotesStats()
  const likesThreshold = Math.ceil((stats.maxLikes || 0) * 0.75)
  const popularList = await db.getQuotesWithLikes(likesThreshold)
  const randomId = Math.floor(Math.random() * popularList.length)
  return c.json(popularList[randomId])
})

app.get('/id',
  validator('query', (query, c) => {
    const querySchema = z.object({
      id: z.coerce.number().int()
    })
    const queryParse = querySchema.safeParse(query)
    if (queryParse.success) {
      return queryParse.data
    } else {
      return c.json({message: 'Invalid request format'}, 400)
    }
  }),
  async (c) => {
    const queryData = c.req.valid('query')
    const db = useDB(c)
    const quote = await db.getQuoteById(queryData.id)
    if (quote.length < 1) {
      return c.json({message: 'Invalid quote ID'}, 400)
    } else {
      return c.json(quote[0])
    }
  }
)

app.post('/new', 
  validator('json', (body, c) => {
    const bodySchema = z.object({
      name: z.string(),
      quote: z.string()
    })
    const bodyParse = bodySchema.safeParse(body)
    if (bodyParse.success) {
      return bodyParse.data
    } else {
      return c.json({message: 'Invalid request format'}, 400)
    }
  }),
  async (c) => {
    const bodyData = c.req.valid('json')
    const db = useDB(c)
    const id = await db.newQuote(bodyData.name, bodyData.quote)
    return c.json(id)
  }
)

app.post('/like', 
  validator('json', (body, c) => {
    const bodySchema = z.object({
      id: z.number().int()
    })
    const bodyParse = bodySchema.safeParse(body)
    if (bodyParse.success) {
      return body
    } else {
      return c.json({message: 'Invalid request format'}, 400)
    }
  }),
  async (c) => {
    const bodyData = c.req.valid('json')
    const db = useDB(c)
    const quote = await db.getQuoteById(bodyData.id)
    if (quote.length < 1) {
      return c.json({message: 'Invalid quote ID'}, 400)
    }
    await db.likeQuote(bodyData.id)
    return c.body(null, 204)
  }
)

export default app
