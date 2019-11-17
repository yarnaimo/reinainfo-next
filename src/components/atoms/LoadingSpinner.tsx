import React, { FC } from 'react'
import { CircularProgress } from 'rmwc'
import { SolidColumn } from '../blocks/Flex'

type Props = {}

export const LoadingSpinner: FC<Props> = props => {
    return (
        <SolidColumn ai="center" css={{ margin: '24px' }}>
            <CircularProgress size="large" theme="secondary"></CircularProgress>
        </SolidColumn>
    )
}
