import React, { FC } from 'react'
import {} from 'rmwc'
import { color } from '../../utils/color'
import { margin } from '../../utils/css'
import { Liquid, Solid } from '../blocks/Flex'

type Props = { text: string }

export const Heading2: FC<Props> = ({ text, children, ...props }) => {
    return (
        <Solid ai="center" {...props} css={{ ...margin({ y: 24 }) }}>
            <Solid>
                <h2
                    css={{
                        ...margin({ y: 0 }),
                        color: color.brown(0.75),
                    }}
                >
                    {text}
                </h2>
            </Solid>

            <Liquid></Liquid>

            {children}
        </Solid>
    )
}
