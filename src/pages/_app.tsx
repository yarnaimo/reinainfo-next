process.env.TZ = 'Asia/Tokyo'
import { Global } from '@emotion/core'
import styled from '@emotion/styled'
import '@mdi/font/css/materialdesignicons.css'
import 'material-colors/dist/colors.var.css'
import 'modern-normalize/modern-normalize.css'
import { AppType } from 'next/dist/next-server/lib/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { config } from '../.config/default'
import { GlobalStyle } from '../components/styles/GlobalStyle'
import { Layout } from '../components/templates/Layout'
import { env } from '../env'
import '../styles/style.scss'
import { appbarHeight, responsive } from '../utils/css'
import { useGA } from '../utils/ga'
const { PageTransition } = require('next-page-transitions') // eslint-disable-line

const Spacer = styled.div({
  height: appbarHeight.default + 4,
  [responsive.isMobile]: { height: appbarHeight.mobile + 4 },
})

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter()
  useGA(config.trackingId)

  if (router.pathname.startsWith('/_headless/')) {
    return (
      <>
        <GlobalStyle></GlobalStyle>
        <Global styles={{ html: { overflow: 'hidden' } }}></Global>

        <Component {...pageProps} />
      </>
    )
  }

  // https://github.com/illinois/next-page-transitions/blob/master/src/PageTransition.js
  // const [originalScrollTo, setOriginalScrollTo] = useState<
  //     typeof window.scrollTo
  // >()
  // const [disableScrolling, setDisableScrolling] = useState(false)

  // useEffect(() => {
  //     if (typeof window !== 'undefined') {
  //         // Forgive me for what I'm about to do
  //         setOriginalScrollTo(window.scrollTo)
  //         window.scrollTo = (...args: any) => {
  //             if (disableScrolling) {
  //                 return
  //             }
  //             originalScrollTo!.apply(window, args)
  //         }
  //     }

  //     return () => {
  //         if (originalScrollTo && typeof window !== 'undefined') {
  //             window.scrollTo = originalScrollTo
  //         }
  //     }
  // }, [])

  return (
    <>
      <GlobalStyle></GlobalStyle>

      <Head>
        <title>{env.longAppName}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>

      <Layout>
        <div css={{ position: 'relative' }}>
          {/* <PageTransition
            timeout={250}
            classNames="page-transition"
            monkeyPatchScrolling
          > */}
          <div
            key={router.route}
            // variants={pageFadeVariants}
            // initial="hidden"
            // animate="visible"
            // exit="hidden"
            css={
              {
                // position: 'absolute',
                // width: '100%',
                // top: 0,
                // left: 0,
              }
            }
          >
            <Spacer
              css={{
                [responsive.isMobile]: { display: 'none' },
              }}
            ></Spacer>
            <Component {...pageProps} />
            <Spacer
              css={{
                display: 'none',
                [responsive.isMobile]: { display: 'block' },
              }}
            ></Spacer>
          </div>
          {/* </PageTransition> */}

          <Global
            styles={`
                            .page-transition-enter {
                                opacity: 0;
                            }
                            .page-transition-enter-active {
                                opacity: 1;
                                transition: opacity 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
                            }
                            .page-transition-exit {
                                opacity: 1;
                            }
                            .page-transition-exit-active {
                                opacity: 0;
                                transition: opacity 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
                            }
                        `}
          ></Global>
        </div>
      </Layout>
    </>
  )
}

export default MyApp
