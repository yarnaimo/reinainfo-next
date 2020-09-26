import { NextApiResponse } from 'next'

export const sendCalendar = (res: NextApiResponse, content: string) => {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
  res.setHeader('Content-Type', 'text/calendar')
  res.send(content)
}
