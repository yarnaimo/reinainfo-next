import React, { FC } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {} from 'rmwc'
import { firebaseAuth } from '../../services/firebase-auth'
import { AdminContainer } from '../blocks/Container'

type Props = {}

export const AdminLayout: FC<Props> = ({ children }) => {
  const [user, loading, error] = useAuthState(firebaseAuth)

  if (!user) {
    return <></>
  }

  return <AdminContainer>{children}</AdminContainer>
}
