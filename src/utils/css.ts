import { CSSObject } from '@emotion/css'
import is from '@sindresorhus/is'
import { Properties } from 'csstype'
import { MediaQueryObject } from 'use-media/lib/types'
import { queryObjectToString } from 'use-media/lib/utilities'

const qs = (query: string | MediaQueryObject) =>
    `@media ${queryObjectToString(query)}`

export const responsive = {
    isMobile: qs({ maxWidth: 767 }), //839
    isNarrow: qs({ maxWidth: 599 }),
}
export const appbarHeight = { default: 72, mobile: 68 }

export const elevation = (n: number) => `mdc-elevation--z${n}`

export const important = (value: string) => `${value}!important`

export const ellipsis: CSSObject = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
}

export const verticalScrollable: CSSObject = { overflowX: 'auto' }

export const size = (width: string | number, height: string | number) => ({
    width,
    height,
})
export const minSize = (
    minWidth: string | number,
    minHeight: string | number,
) => ({
    minWidth,
    minHeight,
})
export const maxSize = (
    maxWidth: string | number,
    maxHeight: string | number,
) => ({
    maxWidth,
    maxHeight,
})

const createSpacer = (type: 'margin' | 'padding' | 'border') => {
    const prop = (directionUppercased: string) =>
        `${type}${directionUppercased}`

    const set = (
        targetObj: CSSObject,
        value: number | undefined,
        directionUppercased: string,
    ) => {
        if (is.number(value)) {
            targetObj[prop(directionUppercased)] = value
        }
    }

    return ({
        x,
        y,
        ...dimensions
    }: {
        x?: number
        y?: number
        top?: number
        right?: number
        bottom?: number
        left?: number
    }) => {
        if (is.number(x)) {
            dimensions.left = dimensions.right = x
        }
        if (is.number(y)) {
            dimensions.top = dimensions.bottom = y
        }

        const { top, right, bottom, left } = dimensions
        const target: CSSObject = {}

        set(target, top, 'Top')
        set(target, right, 'Right')
        set(target, bottom, 'Bottom')
        set(target, left, 'Left')

        return target
    }
}

export const margin = createSpacer('margin')
export const padding = createSpacer('padding')
export const border = createSpacer('border')

const fit: CSSObject = {
    top: 0,
    left: 0,
    ...size('100%', '100%'),
}

export const absoluteFit: CSSObject = {
    position: 'absolute',
    ...fit,
}

export const fixedFit: CSSObject = {
    position: 'fixed',
    ...fit,
}

export const curve = {
    std: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    acc: 'cubic-bezier(0.4, 0.0, 1, 1)',
    dec: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
}

export class Motion {
    hyphenateRegex = /[A-Z]|^ms/g

    join(array: any[]) {
        return array.join(', ')
    }

    processSeconds(seconds: number[]) {
        return this.join(seconds.map(time => `${time}s`))
    }

    repeat<T>(length: number, array: T[]) {
        return Array(length)
            .fill(null)
            .map((_, i) => array[i % array.length])
    }

    easingType: string[] = []
    properties: string[] = []
    durations: number[] = []
    delays: number[] = []

    add(
        easingType: keyof typeof curve,
        properties: (keyof Properties)[],
        durations: number[] = [0.2],
        delays: number[] = [0],
    ) {
        const { length } = properties
        const clone = new Motion()
        clone.easingType = [
            ...this.easingType,
            ...clone.repeat(length, [curve[easingType]]),
        ]
        clone.properties = [
            ...this.properties,
            ...(properties as string[]).map((styleName: string) =>
                styleName.replace(clone.hyphenateRegex, '-$&').toLowerCase(),
            ),
        ]
        clone.durations = [
            ...this.durations,
            ...clone.repeat(length, durations),
        ]
        clone.delays = [...this.delays, ...clone.repeat(length, delays)]

        return clone
    }

    toCss(): CSSObject {
        const propertyString = this.join(this.properties)
        return {
            transitionTimingFunction: this.join(this.easingType),
            transitionProperty: propertyString,
            transitionDuration: this.processSeconds(this.durations),
            transitionDelay: this.processSeconds(this.delays),
            willChange: propertyString,
        }
    }
}

export const transition = (
    easingType: keyof typeof curve,
    properties: (keyof Properties)[],
    durations?: number[],
    delays: number[] = [0],
) => {
    const _motion = new Motion()
    return _motion.add(easingType, properties, durations, delays).toCss()
}
