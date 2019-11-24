import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Button } from 'rmwc'
import { Container } from '../../components/blocks/Container'
import { Title } from '../../components/templates/Title'
import { login } from '../../services/firebase'

type Props = {}

const AdminLoginPage: NextPage<Props> = props => {
    const router = useRouter()

    return (
        <Container>
            <Title title="ログイン" path="login"></Title>

            <Button
                icon="exit_to_app"
                unelevated
                onClick={async () => {
                    await login()
                    router.push('/admin')
                    // router.push((router.query.referrerPath as string) || '/')
                }}
            >
                ログイン
            </Button>
        </Container>
    )
}

// Login.getInitialProps = async ({ req }) => {
//     return {}
// }

export default AdminLoginPage
