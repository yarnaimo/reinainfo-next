import { NextApiHandler } from 'next'
import { sendCalendar } from '../../../services/calendar'
import { db } from '../../../services/firebase'

const docId = 'sub'

const getSubCalendar: NextApiHandler = async (req, res) => {
  const cal = await db.calendars.getDoc({ doc: docId })
  if (!cal) {
    res.status(500).send('failed to get calendar')
    return
  }

  sendCalendar(res, cal.content)
  return
}

export default getSubCalendar
