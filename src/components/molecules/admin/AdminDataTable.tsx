import React, { FC } from 'react'
import { SimpleDataTable } from 'rmwc'
import { verticalScrollable } from '../../../utils/css'
import { Section } from '../../blocks/Section'

type Props = {
  header: string[]
  data: { tableRow: any[] }[]
}

export const AdminDataTable: FC<Props> = ({ header, data }) => (
  <Section css={verticalScrollable}>
    <SimpleDataTable
      headers={[header]}
      data={data.map(({ tableRow }, i) => {
        if (i === 0 && tableRow.length !== header.length) {
          console.error('tableRow length not equal to header length')
        }
        return tableRow
      })}
    ></SimpleDataTable>
  </Section>
)
