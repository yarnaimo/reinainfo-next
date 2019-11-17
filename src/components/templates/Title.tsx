import is from '@sindresorhus/is/dist'
import Head from 'next/head'
import React, { FC } from 'react'
import {} from 'rmwc'
import { env } from '../../env'

type Props = {
    title: string | undefined
}

export const Title: FC<Props> = ({ title }) => {
    return (
        <Head>
            <title>
                {is.undefined(title)
                    ? env.appName
                    : `${title} - ${env.appName}`}
            </title>
        </Head>
    )
}
