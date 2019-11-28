import { Request, Response } from 'express'
import next from 'next'
import { env } from '../../src/env'

const nextServer =
    !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'next'
        ? next({
              dev: env.isDev,
              dir: 'src',
          })
        : null

const handle = nextServer?.getRequestHandler()

export const _next = async (req: Request, res: Response) => {
    console.log('File: ' + req.originalUrl) // log the page.js file that is being requested
    return nextServer!.prepare().then(() => handle!(req, res))
}
