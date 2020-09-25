jest.setTimeout(30000)
jest.mock('./server/services/firebase-admin')
jest.mock('./server/services/twitter')
jest.mock('@slack/webhook')

const dayjs = require('dayjs')
const mockDate = dayjs('2019-12-01')
const dateUtilsModule = require('./src/utils/date')
jest.spyOn(dateUtilsModule, 'wDateBase').mockImplementation(() => mockDate)
