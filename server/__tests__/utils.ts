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
