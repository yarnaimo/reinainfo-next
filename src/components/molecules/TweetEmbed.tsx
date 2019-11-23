import React, { FC } from 'react'
import Embed from 'react-tweet-embed'
import {} from 'rmwc'

type Props = {
    id: string
}

export const TweetEmbed: FC<Props> = ({ id }) => {
    return <Embed id={id} options={{ lang: 'ja', width: '100%' }}></Embed>
}
