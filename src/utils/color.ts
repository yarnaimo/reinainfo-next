import is from '@sindresorhus/is/dist'
import convert from 'color-convert'

export const hsl = (h: number, s: number, l: number) => {
    const [r, g, b] = convert.hsl.rgb([h, s, l])

    return (a = 1) => `rgb(${r}, ${g}, ${b}, ${a})`
}

export const hexToRgba = (hex: string, alpha = 1) => {
    const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16))
    return `rgba(${r},${g},${b},${alpha})`
}

export const materialColor = (color: string, variant: string | number) =>
    `var(--md-${color}-${variant})`

export const themeColor = (theme: string) => `var(--mdc-theme-${theme})`

//

//76E0D7 f96961
export const color = {
    transparent: () => 'transparent',
    background: hsl(48, 100, 96),
    white: hsl(0, 100, 100),
    black: hsl(0, 0, 0),
    brown: hsl(35, 20, 55),

    blue: hsl(211, 41, 57),

    primaryL: hsl(75, 73, 81),
    primary: hsl(162, 63, 64),
    primaryD: hsl(169, 74, 50),
    // primaryL: hsl(3, 71, 73),linear-gradient(135deg,hsl(158, 93%, 71%) 0%,hsl(155, 91%, 61%) 100%)
    // primaryGradient: (deg: number) =>hsla(357, 61%, 64%, 0.54)
    //     `linear-gradient(${deg}deg, hsla(172, 67%, 80%, 1) 0%, hsla(160, 64%, 54%, 1) 100%)`,(3, 93, 68)

    // secondaryL: hsl(49, 95, 66),
    // secondary: hsl(355, 97, 73),

    pink: hsl(3, 77, 75),
    // pink: hsl(352, 85, 65),

    orangeL: hsl(37, 93, 71),
    orange: hsl(42, 97, 50),
    // orange: hsl(21, 91, 61),
}

const sf = (v: string | (() => string)) => (is.string(v) ? v : v())

//

export const gradientFn = (deg: number, stop?: string) => (
    c1: string | (() => string),
    c2: string | (() => string),
) =>
    `linear-gradient(${deg}deg, ${sf(c1)} ${stop || '0%'}, ${sf(c2)} ${stop ||
        '100%'})`

export const cardGradient = gradientFn(120, 'calc(100% - 73px)')
export const categoryChipGradient = gradientFn(135, '50%')
export const cardLight = gradientFn(120)

export const gradients = {
    primary: cardGradient(color.primaryL(), color.primary()),
    // secondary: gradientFn(color.secondaryL(), color.secondary()),
    orange: cardGradient(color.orangeL(), color.orange()),
}

export const shadowFn = (x: number, y: number, b: number, s: number) => (
    color: string,
) => `${x}px ${y}px ${b}px ${s}px ${color}`

export const appbarShadow = shadowFn(0, 2, 7, -1)
export const dialogShadow = shadowFn(0, 9, 33, 1)

export const cardShadow = shadowFn(0, 3, 15, -2) // 10, -1 // 0, 3, 15, -2
export const cardShadowHovered = shadowFn(0, 3, 20, -1) // 10, -1

// export const shadows = {
//     black: shadowFn(color.black(0.11)),
//     primary: shadowFn(color.primary(0.4)),
//     // secondary: shadowFn(color.secondary(0.2)),
//     orange: shadowFn(color.orange(0.2)),
// }
