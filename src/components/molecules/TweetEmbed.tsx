import React, { FC, memo } from 'react'
import Embed from 'react-tweet-embed'
import {} from 'rmwc'

type Props = {
    id: string
}

export const TweetEmbed: FC<Props> = memo(
    ({ id }) => {
        return (
            <Embed
                id={id}
                options={{ lang: 'ja', width: '100%', overflow: 'hidden' }}
            ></Embed>
        )
    },
    (a, b) => a.id === b.id,
)
