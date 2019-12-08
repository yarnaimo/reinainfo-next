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
import { openTweetDialog } from '../../services/twitter'
import { appbarShadow, color } from '../../utils/color'
import {
    appbarHeight,
    important,
    margin,
    responsive,
    size,
    transition,
} from '../../utils/css'
import { useBool } from '../../utils/hooks'
import { micon } from '../../utils/icon'
import { AppBarSection } from '../blocks/AppBarSection'
import { Container } from '../blocks/Container'
import { Liquid, Solid } from '../blocks/Flex'

type Props = {
    appbarItems?: ReactNode
    appbarAlwaysAtTop?: boolean
}

const tabs = [
    {
        path: '/',
        label: 'Topics',
        icon: 'flash-circle',
        color: color.orange(1),
    },
    {
        path: '/schedules',
        label: 'Schedules',
        icon: 'calendar',
        color: color.blue(0.7),
    },
    {
        path: '/info',
        label: 'Info',
        icon: 'information-outline',
        color: color.blue(0.7),
    },
]

const tabTransition = transition('std', ['color', 'transform'], [0.35], [0.05])
const tabBarTransition = transition(
    'std',
    ['opacity', 'transform'],
    [0.4],
    [0, 0],
)

const Tabs = () => {
    const router = useRouter()
    const currentTabIndex = tabs.findIndex(
        t =>
            router.pathname === t.path ||
            router.pathname.startsWith(t.path + '/'),
    )

    return (
        <Container css={{ ...margin({ y: 0 }) }}>
            <Liquid ai="center" jc="space-around">
                {tabs.map((tab, i) => {
                    const active = currentTabIndex === i

                    return (
                        // <div key={i}>
                        <Link href={tab.path} passHref key={i}>
                            <Solid
                                tag="a"
                                jc="center"
                                ai="center"
                                aria-label={tab.label}
                                css={{
                                    // color: 'inherit',
                                    position: 'relative',
                                    ...size(40, 40),
                                }}
                            >
                                <Icon
                                    icon={micon(tab.icon)}
                                    css={{
                                        ...tabTransition,
                                        color: active
                                            ? tab.color
                                            : color.black(0.3),
                                        transform: active
                                            ? 'scale(1) translateX(0px)'
                                            : 'scale(0.8) translateX(0px)',
                                    }}
                                ></Icon>
                                <div
                                    css={{
                                        position: 'absolute',
                                        bottom: 0,
                                        height: 2,
                                        width: 22,

                                        ...tabBarTransition,
                                        background: tab.color,
                                        opacity: active ? 1 : 0,
                                        transform: active
                                            ? 'scaleX(1)'
                                            : 'scaleX(0.25)',
                                    }}
                                ></div>
                            </Solid>
                        </Link>
                        // </div>
                    )
                })}
            </Liquid>
        </Container>
    )
}

const AppBar: FC<{ openDrawer: () => void }> = memo(({ openDrawer }) => {
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
                            icon={'/assets/icons/apple-touch-icon.png'}
                            css={{
                                opacity: 0.75,
                                // backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '67%',
                            }}
                            // onClick={openDrawer}
                        />
                    </Solid>

                    <Liquid tag={AppBarSection} ai="center" jc="center">
                        <Tabs></Tabs>
                    </Liquid>

                    <Solid tag={AppBarSection} ai="center">
                        <TopAppBarActionItem
                            icon={micon('twitter')}
                            onClick={() => {
                                openTweetDialog(env.origin, env.longAppName)
                            }}
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
