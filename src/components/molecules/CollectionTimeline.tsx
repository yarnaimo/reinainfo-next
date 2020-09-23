import React, { FC, memo, useEffect, useRef } from 'react'
import {} from 'rmwc'
import { margin } from '../../utils/css'

const styles = `
    .timeline-Tweet-text {
        font-size: 14px!important;
        line-height: 18px!important;
        margin-bottom: 0px!important;
    }
    .timeline-Tweet {
        padding: 12px 12px 12px 16px!important;
    }
    .TweetAuthor-avatar {
        left: -3px!important;
    }
    .timeline-Tweet-author {
        margin-bottom: 4px!important;
    }
`

const insertStyles = (iframe: HTMLIFrameElement) => {
  const iframeDocument = iframe.contentDocument

  if (!iframeDocument) {
    return
  }

  const style = iframeDocument.createElement('style')
  style.innerHTML = styles
  iframeDocument.head.appendChild(style)
}

type Props = {
  collectionId?: string
}

export const CollectionTimeline: FC<Props> = memo(
  ({ collectionId }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const { twttr } = window as any
      if (!twttr || !collectionId) {
        return
      }

      twttr.ready().then(({ widgets }: { widgets: any }) => {
        if (!ref.current) {
          return
        }

        const observer = new MutationObserver((records) => {
          records
            .map((r) => [...r.addedNodes])
            .flat(1)
            .map((node) => {
              if (node instanceof HTMLIFrameElement) {
                insertStyles(node)
              }
            })
        })

        observer.observe(ref.current, {
          childList: true,
        })

        ref.current.innerHTML = ''

        widgets.createTimeline(
          {
            sourceType: 'collection',
            id: collectionId.replace(/^custom-/, ''),
          },
          ref.current,
          {
            chrome: 'noheader noborders transparent',
            lang: 'ja',
            linkColor: '#6490BE',
          },
        )
        // .then((twitterWidgetElement: any) => {
        // this.setState({
        //     isLoading: false,
        // })
        // onTweetLoadSuccess &&
        //     onTweetLoadSuccess(twitterWidgetElement)
        // })
        // .catch(onTweetLoadError)
      })
    }, [collectionId])

    return (
      <div ref={ref} css={{ ...margin({ x: -12 }) }}></div>
      // <Embed
      //     id={id}
      //     options={{ lang: 'ja', width: '100%', overflow: 'hidden' }}
      // ></Embed>
    )
  },
  (a, b) => a.collectionId === b.collectionId,
)
