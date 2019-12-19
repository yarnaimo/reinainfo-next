export const openTweetDialog = (url: string, text: string) =>
    window.open(
        `http://twitter.com/share?text=${encodeURIComponent(
            `${text}\n${url}`,
        )}&related=Unoffishama`,
        undefined,
        'width=600,height=320',
    )
