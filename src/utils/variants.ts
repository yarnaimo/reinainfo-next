import { Variants } from 'framer-motion'
import { color } from './color'

export const pageFadeVariants: Variants = {
    hidden: {
        opacity: 0,
        transition: { duration: 0.25 },
    },
    visible: {
        opacity: 1,
        transition: { duration: 0.25 },
    },
}

// export const cardVariants: Variants = {
//     initial: {
//         y: 8,
//         opacity: 0,
//         scale: 0.98,
//         transition: {
//             y: { stiffness: 100 },
//         },
//     },
//     enter: {
//         y: 0,
//         opacity: 1,
//         scale: 1,
//         transition: {
//             y: { stiffness: 100, velocity: -100 },
//         },
//     },
//     exit: {
//         y: 8,
//         opacity: 0,
//         scale: 0.98,
//         transition: {
//             y: { stiffness: 100 },
//         },
//     },
// }

// export const toggleVariants: Variants = {
//     off: {
//         color: color.black(0.4),
//         transition: { duration: 0.15 },
//     },
//     on: {
//         color: color.blue(1),
//         transition: { duration: 0.15 },
//     },
// }

export const tabItemVariants: Variants = {
    off: {
        color: color.black(0.3),
        scale: 0.8,
        transition: { duration: 0.25 },
    },
    on: {
        color: color.blue(0.75),
        scale: 1,
        transition: { duration: 0.25 },
    },
}

// export const modalBaseVariants: Variants = {
//     hidden: {
//         opacity: 0,
//         visibility: 'hidden',
//         transition: { duration: 0.125 },
//         // transition: { visibility: {} },
//     },
//     visible: {
//         opacity: 1,
//         visibility: 'visible',
//         transition: { duration: 0.125 },
//         // transition: { velocity: -1000 },
//     },
// }

// export const modalCardVariants: Variants = {
//     hidden: {
//         y: 8,
//         // opacity: 0,
//         scale: 0.98,
//         transition: {
//             duration: 0.125,
//             // y: { stiffness: 100, velocity: 100 },
//         },
//     },
//     visible: {
//         y: 0,
//         // opacity: 1,
//         scale: 1,
//         transition: {
//             duration: 0.125,
//             // y: { stiffness: 100, velocity: -100 },
//         },
//     },
// }
