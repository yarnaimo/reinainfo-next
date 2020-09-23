import { useSDoc } from 'bluespark'
import { NextPage } from 'next'
import React from 'react'
import {} from 'rmwc'
import { ScheduleSection } from '../../../components/molecules/admin/ScheduleSection'
import { AdminLayout } from '../../../components/templates/AdminLayout'
import { Title } from '../../../components/templates/Title'
import { db } from '../../../services/firebase'

type Props = {
  id: string
}

const AdminSerialPage: NextPage<Props> = ({ id }) => {
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

AdminSerialPage.getInitialProps = async (ctx) => {
  const { id } = ctx.query as { id: string }
  return { id }
}

export default AdminSerialPage
