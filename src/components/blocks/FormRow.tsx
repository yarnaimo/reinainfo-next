import styled from '@emotion/styled'
import { margin, padding } from '../../utils/css'
import { Solid } from './Flex'

export const FormRow = styled(Solid)({
  ...padding({ y: 6 }),
  '& > * + *': {
    ...margin({ left: 8 }),
  },
})
