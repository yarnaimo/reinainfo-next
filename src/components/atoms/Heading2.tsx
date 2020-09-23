import React, { FC, forwardRef } from 'react'
import { color } from '../../utils/color'
import { margin } from '../../utils/css'
import { Liquid, Solid } from '../blocks/Flex'

type Props = { text: string; marginY?: number; noColor?: boolean }

export const Heading2: FC<Props> = forwardRef(
  ({ text, marginY = 24, noColor, children, ...props }, ref) => {
    return (
      <Solid
        ref={ref as any}
        ai="center"
        {...props}
        css={{ ...margin({ y: marginY }) }}
      >
        <Solid>
          <h2
            css={{
              ...margin({ y: 0 }),
              color: noColor ? undefined : color.brown(0.75),
            }}
          >
            {text}
          </h2>
        </Solid>

        <Liquid></Liquid>

        {children}
      </Solid>
    )
  },
)
