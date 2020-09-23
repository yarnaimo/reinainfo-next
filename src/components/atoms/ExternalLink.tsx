import { ComponentProps } from '@rmwc/types'
import React, { FC } from 'react'
import { Merge } from 'type-fest'

type Props = Merge<
  ComponentProps,
  {
    href: string | null
  }
>

export const ExternalLink: FC<Props> = ({ href, ...props }) => {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {props.children}
    </a>
  ) : (
    <span {...props}>{props.children}</span>
  )
}
