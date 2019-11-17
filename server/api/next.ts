import { Request, Response } from 'express'
import next from 'next'
import { env } from '../../src/env'

const nextServer = next({
    dev: env.isDev(),
    dir: 'src',
})

const handle = nextServer.getRequestHandler()

export const _next = async (req: Request, res: Response) => {
    console.log('File: ' + req.originalUrl) // log the page.js file that is being requested
    return nextServer.prepare().then(() => handle(req, res))
}
