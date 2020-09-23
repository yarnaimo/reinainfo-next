import React, { FC } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {} from 'rmwc'
import { app } from '../../services/firebase'
import { AdminContainer } from '../blocks/Container'

type Props = {}

export const AdminLayout: FC<Props> = ({ children }) => {
  const [user, loading, error] = useAuthState(app.auth())

  if (!user) {
    return <></>
  }

  return <AdminContainer>{children}</AdminContainer>
}
