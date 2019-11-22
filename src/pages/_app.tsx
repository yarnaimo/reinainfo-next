import { Global } from '@emotion/core'
import styled from '@emotion/styled'
import '@mdi/font/css/materialdesignicons.css'
import { AnimatePresence, motion } from 'framer-motion'
import 'material-colors/dist/colors.var.css'
import 'modern-normalize/modern-normalize.css'
import { AppType } from 'next/dist/next-server/lib/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { Layout } from '../components/templates/Layout'
import { Provider } from '../components/templates/Store'
import { env } from '../env'
import '../styles/style.scss'
import { appbarHeight, responsive } from '../utils/css'
import { pageFadeVariants } from '../utils/variants'

const Spacer = styled.div({
    height: appbarHeight.default + 4,
    [responsive.isMobile]: { height: appbarHeight.mobile + 4 },
})

export const MyApp: AppType = ({ Component, pageProps }) => {
    const router = useRouter()

    if (router.pathname.startsWith('/headless/')) {
        return (
            <Provider>
                <Global styles={{ html: { overflow: 'hidden' } }}></Global>
                <Component {...pageProps} />
            </Provider>
        )
    }

    return (
        <Provider>
            <Head>
                <title>{env.appName}</title>
            </Head>

            <Layout>
                <div css={{ position: 'relative' }}>
                    <AnimatePresence>
                        <motion.div
                            key={router.route}
                            variants={pageFadeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            css={{
                                position: 'absolute',
                                width: '100%',
                                top: 0,
                                left: 0,
                            }}
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Layout>
        </Provider>
    )
}

export default MyApp
