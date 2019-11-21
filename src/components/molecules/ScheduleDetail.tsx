import styled, { CSSObject } from '@emotion/styled'
import { Rstring } from '@yarnaimo/rain'
import dayjs, { Dayjs } from 'dayjs'
import React, {
    ComponentProps,
    FC,
    forwardRef,
    memo,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { Chip, Icon } from 'rmwc'
import { env } from '../../env'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { ITicket } from '../../models/Ticket'
import { db, dbInstance } from '../../services/firebase'
import { cardShadow, color, dialogShadow } from '../../utils/color'
import {
    ellipsis,
    fixedFit,
    margin,
    padding,
    size,
    transition,
} from '../../utils/css'
import { stringifyWDate, stringifyWDateTime } from '../../utils/date'
import { micon } from '../../utils/icon'
import { ExternalLink } from '../atoms/ExternalLink'
import { Container } from '../blocks/Container'
import { Liquid, LiquidColumn, Solid, SolidColumn } from '../blocks/Flex'

const dateTimeOrDate = (withTime: boolean, date: Dayjs | null) => {
    return (
        date &&
        (withTime ? stringifyWDateTime(date, true) : stringifyWDate(date, true))
    )
}

const Block: FC<ComponentProps<typeof Solid> & {
    column?: boolean
    compact: boolean
}> = ({ column, compact, children, ...props }) => {
    const Tag = column ? SolidColumn : Solid
    return (
        <Tag css={{ ...padding({ y: compact ? 2 : 4 }) }} {...props}>
            {children}
        </Tag>
    )
}

const PartChip = styled(Chip)({
    height: 24,
    ...margin({ x: 2, y: 2 }),
    ...padding({ x: 8 }),
    fontSize: 11,
})

const smallFontSize = 12

const decodeTicket = (t: ITicket['_D']) => {
    const now = dayjs(env.isDev() ? '2019-07-25T00:00:00+0900' : undefined)
    const [openDate, closeDate] = [t.opensAt, t.closesAt].map(ts =>
        ts ? dayjs(ts.toDate()) : null,
    )

    const beforeOpen = openDate && now.isBefore(openDate.endOf('day'))
    const beforeClose = closeDate && now.isBefore(closeDate.endOf('day'))

    const toShow = beforeOpen ? 'open' : beforeClose ? 'close' : null

    const openStr = dateTimeOrDate(toShow === 'open', openDate)
    const closeStr = dateTimeOrDate(toShow === 'close', closeDate)

    const timeStr = Rstring.joinOnlyStrings(' ')([openStr, '～', closeStr])

    return {
        text: `${t.label} - ${timeStr}`,
        closed: closeDate && now.isAfter(closeDate),
    }
}

type ModalProps = {
    schedule: IScheduleSerialized
    compact: boolean
}

export const ScheduleDetailModal = memo<ModalProps>(
    ({ children, schedule: s, compact, ...props }) => {
        const [tickets, setTickets] = useState<
            ReturnType<typeof decodeTicket>[]
        >()

        useEffect(() => {
            if (s.hasTickets) {
                db._ticketsIn(dbInstance.doc(s._path))
                    .getQuery({ decoder: decodeTicket })
                    .then(({ array }) => setTickets(array))
            }
        }, [])

        const category = MSchedule.getCategory(s.category)

        const _color = useMemo(
            () =>
                category && {
                    icon: category.textColor?.() ?? color.white(),
                    iconBackground: category.color[0](),
                    iconBoxShadow: cardShadow(category.color[0](0.3)),
                    categoryText: category.textColor?.() ?? category.color[1](),
                    // cardShadowHovered(category.color[0](0.5)),
                },
            [s?.category],
        )

        const sidePadding = 16
        const iconNegativeMargin = -2
        const iconSize = compact ? 12 : 14
        const iconBoxSize = compact ? 18 : 24
        const iconRightMargin = 14
        const leftPadding =
            iconNegativeMargin * 2 + iconBoxSize + iconRightMargin

        const containerStyle: CSSObject = {
            position: 'relative',
            ...padding({
                y: 12,
                left: compact ? sidePadding : sidePadding + leftPadding,
                right: sidePadding,
            }),
            color: color.black(0.7),

            margin: compact ? -4 : 0,
        }

        const Header_ = (
            <Block
                compact={compact}
                ai="center"
                css={{
                    position: 'relative',
                }}
            >
                <Solid
                    jc="center"
                    ai="center"
                    css={[
                        {
                            ...size(iconBoxSize, iconBoxSize),
                            borderRadius: '50%',

                            background: _color.iconBackground,
                            boxShadow: _color.iconBoxShadow,
                            color: _color.icon,
                        },
                        compact
                            ? {
                                  ...margin({ right: 8 }),
                              }
                            : {
                                  position: 'absolute',
                                  top: 2,
                                  left: -leftPadding,
                              },
                    ]}
                >
                    <Icon
                        icon={micon(s.customIcon ?? category.micon)}
                        css={{
                            fontSize: iconSize,
                        }}
                    ></Icon>
                </Solid>

                <div
                    css={{
                        fontSize: 14,
                        color: _color.categoryText,
                    }}
                >
                    {category.name}
                </div>

                <Liquid></Liquid>

                <div
                    css={{
                        fontSize: smallFontSize,
                        ...margin({ left: 10, top: -2 }),
                        ...ellipsis,
                        color: color.black(0.5),
                    }}
                >
                    {s.venue && `@ ${s.venue}`}
                </div>
            </Block>
        )

        const Date_ = (
            <Block compact={compact} ai="baseline">
                <div css={{ fontSize: 14 }}>{s.formattedDate.wdateString}</div>

                <div
                    css={{
                        ...margin({ left: 6 }),
                        fontSize: smallFontSize,
                    }}
                >
                    {s.formattedDate.timeString}
                </div>
            </Block>
        )

        const Title_ = (
            <Block
                compact={compact}
                css={[
                    {
                        fontSize: compact ? 14 : 16,
                        fontWeight: 'bold',
                    },
                    compact && {
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                    },
                ]}
            >
                {s.title}
            </Block>
        )

        const Link_ = !compact && (
            <Block compact={compact} css={{ fontSize: smallFontSize }}>
                <ExternalLink href={s.url}>
                    <Icon
                        icon={micon('open-in-new')}
                        css={{
                            ...margin({ right: 4 }),
                            fontSize: 14,
                            transform: 'translate(-1px,2px)',
                        }}
                    ></Icon>
                    <span>{s.url.replace(/^https?:\/\//, '')}</span>
                </ExternalLink>
            </Block>
        )

        const Divider_ = !compact && (s.formattedDate.parts || tickets) && (
            <Block compact={compact}></Block>
        )

        const Parts_ = !compact && s.formattedDate.parts && (
            <Block
                compact={compact}
                css={{ ...margin({ x: -3 }), flexWrap: 'wrap' }}
            >
                {s.formattedDate.parts.map((p, i) => (
                    <PartChip
                        key={i}
                        label={
                            p.name
                                ? `${p.name} | ${p.timesOfPart}`
                                : p.timesOfPart
                        }
                    ></PartChip>
                ))}
            </Block>
        )

        const Tickets_ = tickets && (
            <Block compact={compact} column>
                {tickets.map((t, i) => (
                    <Solid
                        key={i}
                        ai="start"
                        css={{ ...padding({ y: compact ? 2 : 3 }) }}
                    >
                        <Solid>
                            <Icon
                                icon={micon('tag-outline')}
                                css={{
                                    ...margin({ left: -1 }),
                                    fontSize: 15,
                                    lineHeight: '15.6px',
                                    transform: 'translateY(0.4px)',
                                }}
                            ></Icon>
                        </Solid>

                        <Liquid
                            css={{
                                ...margin({ left: 4 }),
                                fontSize: compact ? 11 : smallFontSize,
                                letterSpacing: 0,
                            }}
                        >
                            {t.closed ? (
                                <s css={{ color: color.black(0.4) }}>
                                    {t.text}
                                </s>
                            ) : (
                                t.text
                            )}
                        </Liquid>
                    </Solid>
                ))}
            </Block>
        )

        return (
            <Solid css={compact && size(...env.twitterCardSize)} ai="center">
                <LiquidColumn
                    // ref={ref}
                    {...props}
                    css={containerStyle}
                >
                    {Header_}
                    {Date_}
                    {Title_}
                    {Link_}
                    {Divider_}
                    {Parts_}
                    {Tickets_}
                </LiquidColumn>
            </Solid>
        )
    },
    (a, b) => MSchedule.isSame(a.schedule, b.schedule),
)

const fadeMotion = transition('std', ['opacity', 'visibility'])
const cardMotionIn = transition('dec', ['transform'])
const cardMotionOut = transition('acc', ['transform'])

type Props = {
    schedule: IScheduleSerialized
    compact?: boolean
    open: boolean
    onClose?: () => void
}

export const ScheduleDetail = memo(
    forwardRef<any, Props>(
        ({ schedule: s, compact = false, open, onClose, ...props }, ref) => {
            return (
                <SolidColumn
                    jc="center"
                    ai="center"
                    css={{
                        zIndex: 7,
                        ...fixedFit,

                        ...fadeMotion,
                        opacity: open ? 1 : 0,
                        visibility: open ? 'visible' : 'hidden',
                    }}
                >
                    <div
                        onClick={() => onClose?.()}
                        css={{
                            ...fixedFit,
                            zIndex: -1,
                            cursor: 'pointer',
                            // [responsive.isMobile]: {
                            //     display: 'none',
                            // },

                            background: color.black(0.3),
                        }}
                    ></div>

                    <Container
                        css={[
                            cardMotionIn,
                            open ? cardMotionIn : cardMotionOut,
                            {
                                transform: open
                                    ? 'translateY(0px) scale(1)'
                                    : 'translateY(16px) scale(0.95)',
                            },
                        ]}
                    >
                        <ScheduleDetailModal
                            schedule={s}
                            compact={compact}
                            css={{
                                ...margin({ x: -1 }),

                                borderRadius: 11,
                                overflow: 'hidden',
                                boxShadow: dialogShadow(color.black(0.2)),
                                background: color.white(),
                            }}
                        ></ScheduleDetailModal>
                    </Container>
                </SolidColumn>
            )
        },
    ),
    (a, b) => MSchedule.isSame(a.schedule, b.schedule) && a.open === b.open,
)
