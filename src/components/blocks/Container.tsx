import styled from '@emotion/styled'
import { responsive } from '../../utils/css'

// const _Container = styled.div({
//     margin: '0px auto',
//     // width: 'calc(100% - 24px)',
//     maxWidth: 640,
//     padding:'8px 12px',
//     '@media (min-width: 768px)': {
//         // width: '70%',
//     },
// })

export const Container = styled.div({
  width: '70%',
  maxWidth: 640,
  margin: '0px auto',
  // padding: '8px 0',

  [responsive.isMobile]: {
    width: 'calc(100% - 24px)', // padding: '8px 12px',
  },
})

export const AdminContainer = styled(Container)({
  width: 'calc(100% - 24px)',
  maxWidth: 'unset',
})

export const MainContainer = Container.withComponent('main')
