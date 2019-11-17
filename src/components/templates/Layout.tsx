import { motion } from 'framer-motion'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, { FC, memo, ReactNode } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    Icon,
    List,
    ListItem,
    ThemeProvider,
    TopAppBar,
    TopAppBarActionItem,
    TopAppBarNavigationIcon,
    TopAppBarRow,
} from 'rmwc'
import { env } from '../../env'
import { logout } from '../../services/firebase'
import { appbarShadow, color } from '../../utils/color'
import { appbarHeight, important, margin, responsive } from '../../utils/css'
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'
import { tabItemVariants } from '../../utils/variants'
import { AppBarSection } from '../blocks/AppBarSection'
import { Container } from '../blocks/Container'
import { Liquid, Solid } from '../blocks/Flex'

type Props = {
    appbarItems?: ReactNode
    appbarAlwaysAtTop?: boolean
}

const tabs = [
    { path: '/topics', label: 'Topics', icon: 'flash-circle' },
    { path: '/schedules', label: 'Schedules', icon: 'calendar' },
    { path: '/info', label: 'Info', icon: 'information-outline' },
]

const AppBar: FC<{ openDrawer: () => void }> = memo(({ openDrawer }) => {
    const router = useRouter()
    const currentTabIndex = tabs.findIndex(
        t =>
            router.pathname === t.path ||
            router.pathname.startsWith(t.path + '/'),
    )

    return (
        <TopAppBar
            fixed
            css={[
                {
                    top: 0,
                    [responsive.isMobile]: {
                        top: 'unset',
                        bottom: 0,
                    },
                    padding: '0',
                    background: color.white(1),
                    '&.mdc-top-app-bar--fixed-scrolled': {
                        boxShadow: appbarShadow(color.black(0.2)),
                    },
                },
            ]}
        >
            <ThemeProvider
                options={{
                    // primary: color.background(),
                    // onSurface: color.background(),
                    onPrimary: color.black(0.3),
                }}
                wrap
            >
                <TopAppBarRow
                    css={{
                        height: appbarHeight.default,
                        [responsive.isMobile]: {
                            height: appbarHeight.mobile,
                        },
                    }}
                >
                    <Solid
                        tag={AppBarSection}
                        ai="center"
                        css={
                            {
                                // transform: isNarrow ? 'scale(0.8)' : undefined,
                            }
                        }
                    >
                        <TopAppBarNavigationIcon
                            // icon={'/assets/icons/button-icon.png'}
                            css={{
                                opacity: 0.75,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                            onClick={openDrawer}
                        />
                    </Solid>

                    <Liquid tag={AppBarSection} ai="center" jc="center">
                        <Container css={{ ...margin({ y: 0 }) }}>
                            <Liquid ai="center" jc="space-around">
                                {tabs.map((tab, i) => {
                                    const animate =
                                        currentTabIndex === i ? 'on' : 'off'

                                    return (
                                        <motion.div
                                            key={i}
                                            variants={tabItemVariants}
                                            initial={animate}
                                            animate={animate}
                                        >
                                            <Link href={tab.path} passHref>
                                                <a
                                                    css={{
                                                        color: 'inherit',
                                                    }}
                                                >
                                                    <Icon
                                                        icon={micon(tab.icon)}
                                                    ></Icon>
                                                </a>
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </Liquid>
                        </Container>
                    </Liquid>

                    <Solid tag={AppBarSection} ai="center">
                        <TopAppBarActionItem
                            css={{}}
                            icon={micon('twitter')}
                            onClick={() => {}}
                        />
                    </Solid>
                </TopAppBarRow>
            </ThemeProvider>
        </TopAppBar>
    )
})

export const Layout: FC<Props> = ({
    children,
    appbarItems,
    appbarAlwaysAtTop,
}) => {
    // const { isMobile, isNarrow, appbarHeight } = useResponsive()
    // const appbarAtTop = !isMobile || appbarAlwaysAtTop
    const drawer = useBool(false)

    const Drawer_ = (
        <Drawer css={{ top: 0 }} modal open={drawer.state} onClose={drawer.off}>
            <DrawerHeader css={{ background: color.primary(0.9) }}>
                <DrawerTitle css={{ color: important(color.background()) }}>
                    {env.appName}
                </DrawerTitle>
            </DrawerHeader>

            <DrawerContent>
                <List>
                    <ListItem onClick={() => Router.push('/')}>ホーム</ListItem>
                    <ListItem onClick={() => Router.push('/feed-settings')}>
                        Feed ソースの一覧
                    </ListItem>
                    <ListItem onClick={() => Router.push('/tweet-settings')}>
                        Tweet ソースの一覧
                    </ListItem>
                    <ListItem onClick={logout}>ログアウト</ListItem>
                </List>
            </DrawerContent>
        </Drawer>
    )

    return (
        <>
            <AppBar openDrawer={drawer.on}></AppBar>

            {Drawer_}

            {children}
        </>
    )
}
