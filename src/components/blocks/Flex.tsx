import { CSSObject } from '@emotion/styled'
import { ComponentProps } from '@rmwc/types'
import React, { forwardRef } from 'react'
import { animated } from 'react-spring'
import {} from 'rmwc'

type Props = {
    jc?: CSSObject['justifyContent']
    ai?: CSSObject['alignItems']
}

export const createFlexComponent = (
    styleAsFlexItem: CSSObject,
    flexDirection: CSSObject['flexDirection'],
) => {
    const Component = animated(
        forwardRef<any, ComponentProps & Props>(
            (
                {
                    tag: Tag = 'div',
                    css,
                    jc: justifyContent,
                    ai: alignItems,
                    children,
                    ...props
                },
                ref,
            ) => {
                return (
                    <Tag
                        css={[
                            {
                                display: 'flex',
                                flexDirection,
                                justifyContent,
                                alignItems,
                            },
                            styleAsFlexItem,
                            css,
                        ]}
                        {...props}
                        ref={ref}
                    >
                        {children}
                    </Tag>
                )
            },
        ),
    )

    return Object.assign(Component, {}) as typeof Component & {}
}

export const Solid = createFlexComponent(
    {
        flexGrow: 0,
        flexShrink: 0,
    },
    'row',
)
export const SolidColumn = createFlexComponent(
    {
        flexGrow: 0,
        flexShrink: 0,
    },
    'column',
)

export const Liquid = createFlexComponent(
    {
        flexGrow: 1,
        flexShrink: 1,
    },
    'row',
)
export const LiquidColumn = createFlexComponent(
    {
        flexGrow: 1,
        flexShrink: 1,
    },
    'column',
)
