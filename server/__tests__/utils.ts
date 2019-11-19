import * as twitterModule from '../services/twitter'
import { TwimoClient } from '../services/twitter'

export const spyOnTwimo = (twimo: Partial<TwimoClient>) =>
    jest
        .spyOn(twitterModule, 'getTwimoClient')
        .mockResolvedValue(twimo as TwimoClient)

export const mockTwimo = (twimo: Partial<TwimoClient>) => twimo as TwimoClient

export const expectObjectArrayContaining = (
    actual: any,
    expectedLength: number,
    expectedArr: any[],
) => {
    expect(actual).toHaveLength(expectedLength)
    expect(actual).toEqual(
        expect.arrayContaining(
            expectedArr.map(o => expect.objectContaining(o)),
        ),
    )
}
