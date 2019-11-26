export const openTweetDialog = (url: string, text: string) =>
    window.open(
        `http://twitter.com/share?url=${encodeURIComponent(
            url,
        )}&text=${encodeURIComponent(
            text,
        )}&related=Unoffishama&hashtags=reinainfo_next`,
        undefined,
        'width=600,height=320',
    )
