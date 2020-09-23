// export const micon = (icon: string) => ({
//     icon,
//     strategy: 'className',
//     basename: 'material-icons mdi',
//     prefix: 'mdi-',
// })

import React, { FC } from 'react'

type Props = {
  icon: string
}

export const MIcon: FC<Props> = (props) => {
  return <i className={`mdi mdi-${props.icon}`}></i>
}

export const micon = (icon: string) => <MIcon icon={icon}></MIcon>
