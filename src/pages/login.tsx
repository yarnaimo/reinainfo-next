import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { Button } from 'rmwc'
import { Container } from '../components/blocks/Container'
import { Title } from '../components/templates/Title'
import { login } from '../services/firebase'

type Props = {}

const Login: NextPage<Props> = props => {
    const router = useRouter()

    return (
        <>
            <Head>
                <Title title="ログイン" path="login"></Title>
            </Head>

            <Container>
                <Button
                    icon="exit_to_app"
                    unelevated
                    onClick={async () => {
                        await login()
                        router.push(
                            (router.query.referrerPath as string) || '/',
                        )
                    }}
                >
                    ログイン
                </Button>
            </Container>
        </>
    )
}

Login.getInitialProps = async ({ req }) => {
    return {}
}

export default Login
