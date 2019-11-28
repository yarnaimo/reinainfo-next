import styled, { CSSObject } from '@emotion/styled'
import { MSpark } from 'bluespark'
import React, { ComponentProps, FC, memo, useMemo } from 'react'
import { Button, Chip, Icon } from 'rmwc'
import { SetOptional } from 'type-fest'
import { env } from '../../env'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { ITicket, MTicket } from '../../models/Ticket'
import { openTweetDialog } from '../../services/twitter'
import { cardShadow, color } from '../../utils/color'
import { ellipsis, margin, padding, size } from '../../utils/css'
import { micon } from '../../utils/icon'
import { ExternalLink } from '../atoms/ExternalLink'
import { Liquid, LiquidColumn, Solid, SolidColumn } from '../blocks/Flex'

const Block: FC<ComponentProps<typeof Solid> & {
    column?: boolean
    compact: boolean
}> = ({ column, compact, children, ...props }) => {
    const Tag = column ? SolidColumn : Solid
    return (
        <Tag css={{ ...padding({ y: compact ? 2.5 : 4 }) }} {...props}>
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

type Props = {
    schedule: SetOptional<IScheduleSerialized, '_path'>
    tickets?: ITicket['_D'][]
    compact: boolean
}

export const ScheduleDetailContent = memo<Props>(
    ({ children, schedule: s, tickets, compact, ...props }) => {
        const decodedTickets = tickets && tickets.map(MTicket.stringify)
        const category = MSchedule.getCategory(s.category)

        const [textColor, background, boxShadow, categoryTextColor] = useMemo(
            () => [
                category.textColor?.() ?? color.white(),
                category.color[0](),
                cardShadow(category.color[0](0.3)),
                category.textColor?.() ?? category.color[1](),
            ],
            // cardShadowHovered(category.color[0](0.5)),
            [category],
        )

        const sidePadding = 16
        const sidePaddingCompact = 12
        const iconNegativeMargin = -2
        const iconSize = compact ? 14 : 14
        const iconBoxSize = compact ? 18 : 24
        const iconRightMargin = 14
        const leftPadding =
            iconNegativeMargin * 2 + iconBoxSize + iconRightMargin

        const containerPadding = compact
            ? {
                  x: sidePaddingCompact,
                  top: 0,
              }
            : {
                  y: 12,
                  left: sidePadding + leftPadding,
                  right: sidePadding,
              }

        const containerStyle: CSSObject = {
            position: 'relative',
            ...padding(containerPadding),
        }

        const Icon_ = (
            <Icon
                icon={micon(s.customIcon ?? category.micon)}
                css={{
                    fontSize: iconSize,
                }}
            ></Icon>
        )

        const HeaderRight_ = (
            <>
                <Solid
                    css={{
                        fontSize: 13,
                        color: compact ? textColor : categoryTextColor,
                    }}
                >
                    {category.name}
                </Solid>

                <Liquid></Liquid>

                <div
                    css={{
                        fontSize: 11.5,
                        ...margin({ left: 10, top: compact ? 0 : 0 }),
                        ...ellipsis,
                        color: compact ? textColor : color.black(0.5),
                    }}
                >
                    {s.venue && `@ ${s.venue}`}
                </div>
            </>
        )

        const Header_ = compact ? (
            <Block
                compact={compact}
                ai="center"
                css={{
                    ...margin({ x: -sidePaddingCompact, bottom: 3 }),
                    ...padding({ x: sidePaddingCompact }),
                    height: 30,
                    background,
                    color: textColor,
                }}
            >
                <Solid ai="center" css={{ ...margin({ left: -1, right: 8 }) }}>
                    {Icon_}
                </Solid>

                {HeaderRight_}
            </Block>
        ) : (
            <Block compact={compact} ai="center" css={{ position: 'relative' }}>
                <Solid
                    jc="center"
                    ai="center"
                    css={{
                        ...size(iconBoxSize, iconBoxSize),
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 2,
                        left: -leftPadding,

                        background,
                        boxShadow,
                        color: textColor,
                    }}
                >
                    {Icon_}
                </Solid>

                {HeaderRight_}
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
            <Block
                compact={compact}
                css={{ fontSize: smallFontSize, lineHeight: 1.4 }}
            >
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

        const Divider_ = !compact &&
            (s.formattedDate.parts || decodedTickets) && (
                <Block compact={compact}></Block>
            )

        const Parts_ = s.formattedDate.parts && (!compact || !decodedTickets) && (
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

        const Tickets_ = decodedTickets && (
            <Block compact={compact} column>
                {decodedTickets.map((t, i) => (
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

        const Actions_ = !compact && (
            <Block
                compact={compact}
                css={{ ...margin({ top: -2, bottom: -6 }) }}
            >
                <Liquid></Liquid>
                {/* <TweetButton
                    url={`${env.origin}/schedules/${s._id}`}
                    text={`${s.title}`}
                > */}
                {s._path && (
                    <Button
                        icon={micon('twitter')}
                        label="ツイート"
                        dense
                        theme="secondary"
                        ripple={{ accent: true }}
                        css={{ opacity: 0.8 }}
                        onClick={() =>
                            openTweetDialog(
                                MSchedule.getPageUrl(s as IScheduleSerialized)!,
                                s.title,
                            )
                        }
                    ></Button>
                )}
                {/* </TweetButton> */}
            </Block>
        )

        return (
            <Solid
                css={
                    compact && {
                        position: 'relative',
                        ...size(...env.twitterCardSize),
                    }
                }
                // ai="center"
            >
                {/* {compact && (
                    <Solid
                        css={{
                            position: 'absolute',
                            left: 0,
                            ...size(2.5, '100%'),
                            background: background,
                        }}
                    ></Solid>
                )} */}
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
                    {Actions_}
                </LiquidColumn>
            </Solid>
        )
    },
    (a, b) =>
        MSpark.isEqual(
            a.schedule as IScheduleSerialized,
            b.schedule as IScheduleSerialized,
        ) && a.tickets === b.tickets,
)
