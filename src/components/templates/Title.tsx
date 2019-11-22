import Head from 'next/head'
import React, { FC } from 'react'
import {} from 'rmwc'
import { env } from '../../env'

type Props = {
    title: string
    article?: boolean
    content?: string
    path: string | null
    thumbUrl?: string
}

export const Title: FC<Props> = ({
    title,
    article,
    content,
    path,
    thumbUrl,
}) => {
    const url = path ? `${env.origin}/${path}` : env.origin

    return (
        <Head>
            <title>{`${title} | ${env.appName}`}</title>
            <meta
                property="og:type"
                content={article ? 'article' : 'website'}
            />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={content} />
            <meta property="og:image" content={thumbUrl} />
            <meta property="og:site_name" content={env.appName} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={`@${env.screenName}`} />
            <meta name="twitter:creator" content={`@${env.screenName}`} />
        </Head>
    )
}
