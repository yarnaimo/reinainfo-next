import { ComponentProps } from '@rmwc/types'
import { MSpark } from 'bluespark'
import { MotionProps } from 'framer-motion'
import Link from 'next/link'
import React, { forwardRef, memo, useMemo } from 'react'
import { Icon, Ripple } from 'rmwc'
import { IScheduleSerialized, MSchedule } from '../../models/Schedule'
import { cardGradient, cardShadow, color } from '../../utils/color'
import { ellipsis, margin, padding, size } from '../../utils/css'
import { micon } from '../../utils/icon'
import { Liquid, Solid, SolidColumn } from '../blocks/Flex'

type Props = ComponentProps &
  MotionProps & {
    schedule: IScheduleSerialized
  }

export const ScheduleCard = memo(
  forwardRef<any, Props>(({ schedule: s, ...props }, ref) => {
    const category = MSchedule.getCategory(s.category)

    const [textColor, background, boxShadow] = useMemo(
      () => [
        category.textColor?.() ?? color.white(),
        cardGradient(category.color[0], category.color[1]),
        cardShadow(category.color[0](0.4)),
      ],
      [category],
    )

    const sidePadding = 18
    const iconNegativeMargin = -2
    const iconSize = 18
    const iconBoxSize = 18
    const iconRightMargin = 12
    const leftPadding = iconNegativeMargin * 2 + iconBoxSize + iconRightMargin

    const Content_ = (
      <SolidColumn
        css={{
          borderRadius: 9,
          position: 'relative',
          overflow: 'hidden',
          ...padding({
            y: 6,
            left: sidePadding + leftPadding,
            right: sidePadding,
          }),
          boxShadow,
          background,
          color: textColor,
        }}
      >
        <Solid // header
          ai="center"
          css={{
            ...margin({ left: -leftPadding }),
            ...padding({ y: 4 }),
          }}
        >
          <Solid ai="center">
            <Solid
              css={{
                position: 'relative',
                ...margin({
                  x: iconNegativeMargin,
                  y: iconNegativeMargin / 2,
                }),
                ...size(iconBoxSize, iconBoxSize),
              }}
            >
              <Icon
                icon={micon(s.customIcon ?? category.micon)}
                css={{
                  zIndex: 1,
                  fontSize: iconSize,
                }}
              ></Icon>

              {s.ribbonColors && (
                <SolidColumn
                  css={{
                    position: 'absolute',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    width: 96,
                    height: 15,
                    top: '50%',
                    left: '50%',
                  }}
                >
                  {s.ribbonColors.map((c, i) => (
                    <Liquid key={i} css={{ background: c }}></Liquid>
                  ))}
                </SolidColumn>
              )}
            </Solid>

            <div
              css={{
                ...margin({ left: iconRightMargin }),
                fontSize: 11,
              }}
            >
              {category.name}
            </div>
          </Solid>

          <Liquid></Liquid>

          <div
            css={{
              fontSize: 10,
              ...margin({ left: 10 }),
              ...ellipsis,
            }}
          >
            {s.venue && `@ ${s.venue}`}
          </div>
        </Solid>

        <Solid // date
          ai="baseline"
          css={{
            ...padding({ y: 4 }),
            fontWeight: 500,
          }}
        >
          <div css={{ fontSize: 12 }}>{s.formattedDate.wdateString}</div>

          <div css={{ ...margin({ left: 6 }), fontSize: 11 }}>
            {s.formattedDate.timeString}
          </div>
        </Solid>

        <Solid // title
          css={{
            ...padding({ y: 4 }),
            fontSize: 15,
            fontWeight: 'bold',
          }}
        >
          {s.title}
        </Solid>
      </SolidColumn>
    )

    return (
      <Link
        href={s.isSerial ? '' : `/schedules/${s._id}`}
        passHref
        scroll={false}
      >
        <a
          ref={ref as any}
          {...props}
          css={{
            display: 'block',
            ...margin({ y: 12, x: -1 }),
          }}
        >
          <Ripple
            css={{
              '&::before, &::after': {
                opacity: 0,
                transition: `opacity 25ms linear`,
                backgroundColor: textColor,
              },
              '&:hover::before': {
                // opacity: 0.05,
              },
            }}
          >
            {Content_}
          </Ripple>
        </a>
      </Link>
    )
  }),
  (a, b) => MSpark.isEqual(a.schedule, b.schedule),
)

// export const ScheduleCard = memo<Props>(({ schedule }) => {
//     return <_ScheduleCard schedule={schedule}></_ScheduleCard>
// }, compareFn)
