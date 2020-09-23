import React, { FC, memo, useEffect, useRef } from 'react'
import {} from 'rmwc'

type Props = {
  id: string
}

export const TweetEmbed: FC<Props> = memo(
  ({ id }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const { twttr } = window as any
      if (!twttr) {
        return
      }

      twttr.ready().then(({ widgets }: { widgets: any }) => {
        if (ref.current) {
          ref.current.innerHTML = ''
        }

        widgets.createTweetEmbed(id, ref.current)
        // .then((twitterWidgetElement: any) => {
        //     this.setState({
        //         isLoading: false,
        //     })
        //     onTweetLoadSuccess &&
        //         onTweetLoadSuccess(twitterWidgetElement)
        // })
        // .catch(onTweetLoadError)
      })
    }, [id])

    return (
      <div ref={ref}></div>
      // <Embed
      //     id={id}
      //     options={{ lang: 'ja', width: '100%', overflow: 'hidden' }}
      // ></Embed>
    )
  },
  (a, b) => a.id === b.id,
)
