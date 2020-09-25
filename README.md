# ReinaInfo Next

声優・上田麗奈さんに関する情報を収集・共有する非公式 Web サービスです 🐈 (v2)

- Web サイト - [ReinaInfo Next](https://reina.one)
- Twitter アカウント - [@Unoffishama](https://twitter.com/Unoffishama)
- 管理者 - [@yarnaimo](https://twitter.com/yarnaimo)

## 使用している技術

**太字**は v2 から新規採用。

- TypeScript
- **Next.js** - サーバーサイドレンダリング (SSR)
- Firebase
  - Firestore - スケジュール・トピックなどが保存される
  - **Cloud Functions** - Next.js の SSR、自動リツイート、スケジュール・チケットの通知などを行う
  - **Storage** - OGP 画像が保存される
  - Hosting - Web サイトのホスティング
- **Puppeteer** - スケジュールページの OGP 画像を自動生成する (Cloud Functions 上で動作)
- TensorFlow.js - 「上田麗奈」のツイート検索結果の中からリツイートすべきツイート (公式アカウントなど) を自動で判別する (機械学習/ロジスティック回帰)
- Emotion - CSS-in-JS ライブラリ

## 機能

### Web サイト

#### Topics ページ

[@Unoffishama](https://twitter.com/Unoffishama) がリツイートしたツイート、写真が掲載されたブログ、新機能のお知らせなどを表示

#### Schedules ページ

ライブ・イベントなど今後の予定を表示。

#### Info ページ

Web サイトや Twitter アカウントに関する情報。

#### Portal ページ

準備中。Accept された人が書き込めるようにするかも

### Twitter

あとで書く
