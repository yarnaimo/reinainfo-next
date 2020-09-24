import { useSDoc } from 'bluespark'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import {} from 'rmwc'
import { ScheduleSection } from '../../../components/molecules/admin/ScheduleSection'
import { AdminLayout } from '../../../components/templates/AdminLayout'
import { Title } from '../../../components/templates/Title'
import { db } from '../../../services/firebase'

type Props = {}

const Page: NextPage<Props> = () => {
  const { query } = useRouter()
  const { id } = query as { id: string }

  const { data: serial } = useSDoc({ model: db.serials, doc: id })
  if (!serial) {
    return <></>
  }
  return (
    <AdminLayout>
      <Title title={`Admin - Serial: ${serial.label}`} path={null}></Title>

      <ScheduleSection
        serial={serial}
        heading={`Serial: ${serial.label}`}
      ></ScheduleSection>
    </AdminLayout>
  )
}

export default Page
