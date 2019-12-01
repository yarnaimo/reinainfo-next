# ReinaInfo Next

声優・上田麗奈さんに関する情報を収集・共有する非公式 Web サービスです 🐈 (v2)

- Webサイト - [ReinaInfo Next](https://reinainfo-next.web.app)
- Twitterアカウント - [@Unoffishama](https://twitter.com/Unoffishama)
- 管理者 - [@yarnaimo](https://twitter.com/yarnaimo)
## 使用している技術

**太字**はv2から新規採用。

- TypeScript
- **Next.js** - サーバーサイドレンダリング (SSR)
- Firebase
  - Firestore - スケジュール・トピックなどが保存される
  - **Cloud Functions** - Next.jsのSSR、自動リツイート、スケジュール・チケットの通知などを行う
  - **Storage** - OGP画像が保存される
  - Hosting - Webサイトのホスティング
- **Puppeteer** - スケジュールページのOGP画像を自動生成する (Cloud Functions上で動作)
- TensorFlow.js - 「上田麗奈」のツイート検索結果の中からリツイートすべきツイート (公式アカウントなど) を自動で判別する (機械学習/ロジスティック回帰)
- Emotion - CSS-in-JS ライブラリ

## 機能

### Webサイト

#### Topicsページ

[@Unoffishama](https://twitter.com/Unoffishama) がリツイートしたツイート、写真が掲載されたブログ、新機能のお知らせなどを表示

#### Schedulesページ

ライブ・イベントなど今後の予定を表示。

#### Infoページ

WebサイトやTwitterアカウントに関する情報。

#### Portalページ

準備中。Acceptされた人が書き込めるようにするかも

### Twitter

あとで書く
