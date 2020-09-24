import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Button } from 'rmwc'
import { Container } from '../../components/blocks/Container'
import { Section } from '../../components/blocks/Section'
import { Title } from '../../components/templates/Title'
import { login, logout } from '../../services/firebase'

type Props = {}

const AdminLoginPage: NextPage<Props> = (props) => {
  const router = useRouter()

  return (
    <Container>
      <Title title="ログイン" path="login"></Title>

      <Section>
        <Button
          unelevated
          label="ログイン"
          onClick={async () => {
            await login()
            router.push('/_admin')
            // router.push((router.query.referrerPath as string) || '/')
          }}
        ></Button>
      </Section>

      <Section>
        <Button
          unelevated
          label="ログアウト"
          onClick={async () => {
            await logout()
          }}
        ></Button>
      </Section>
    </Container>
  )
}

export default AdminLoginPage
