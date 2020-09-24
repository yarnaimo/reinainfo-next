import { CSSObject, Global } from '@emotion/core'
import React, { memo } from 'react'
import { color } from '../../utils/color'

const fontFamily = [
  'Ubuntu',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'BIZ UDPゴシック',
  'sans-serif',
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol',
]
  .map((f) => `'${f}'`)
  .concat('sans-serif')
  .join()
// const fontFamily =
//   'adobe-clean-ux,adobe-clean,Source Sans Pro,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif'

const fontSize = 15
const lineHeight = 1.3
const letterSpacing = 0.375

const styles: CSSObject = {
  html: {
    width: '100%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'scroll',
    touchAction: 'manipulation',
    fontSize,
    lineHeight,
    letterSpacing,
    overflowWrap: 'break-word',
    textTransform: 'none',
    WebkitTapHighlightColor: color.transparent(),
    color: color.black(0.87),
  },

  body: {
    fontFamily,
    margin: 0,
  },

  //   '[class*="_spectrum_"][lang], [class*="_spectrum-Button_"]': {
  //     fontFamily,
  //   },
  //   '[class*="_spectrum_"][lang]': {
  //     background: color.transparent,
  //     color: color.text,
  //   },

  //   'h1, h2, h3, h4': {
  //     marginBlockStart: 0,
  //     marginBlockEnd: 0,
  //   },

  a: {
    textDecoration: 'none',
    color: 'hsl(211 41% 57%)',
  },

  'h1, h2': {
    fontFamily: `'Cabin', ${fontFamily}`,
    fontWeight: 600,
    letterSpacing: 0.75,
  },

  'h4, h5': {
    fontWeight: 500,
  },
}

export const GlobalStyle = memo(() => {
  return <Global styles={styles}></Global>
})
