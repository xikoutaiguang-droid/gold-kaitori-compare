@AGENTS.md

# 運用上の点検(日次・予備・週次の担当Claude向け)

GitHub Actionsの日次ジョブ(`.github/workflows/daily-price-refresh.yml`)は、点検スクリプトが1つでも失敗するとジョブが赤くなり、オーナーに毎日失敗メールが届く。2026年11月10日から数日、おたからやの取得失敗とキャンペーン記録の放置で赤いままだったのに、「取得スクリプトの点検は週次の担当の仕事」という指示に従って日次の担当が見送り、メールが毎日届き続けた。点検が失敗しているのを見つけたら、担当の線引きより先に、その場で原因を直す。

- まず手元で実行して終了コードを見る: `node scripts/scrape/check-freshness.mjs` / `node scripts/check-hand-data.mjs` / `node scripts/fix-jp-linebreaks.mjs --check` / `node scripts/check-og-font.mjs`。(`check-pages.mjs` と `check-production.mjs` は公開サイトに接続する。クラウドの作業場は外部サイトに接続できないことがあるので、つながらないときはPCのChromeで開いて確かめる。)
- **取得失敗**(`[NG]` や「価格を1件も取得できませんでした」): `node scripts/scrape/index.mjs <社ID>` で単体実行し、その社のページを実際に開いて構造の変更を確かめ、`scripts/scrape/sources/<社ID>.mjs` を直す。直したら再実行し、件数と値がページの表示と一致することを確かめてからコミットする。2026年11月14日のおたからや(計算ツールの`<select>`が相場表の`ul.pm-rate-tables-block`に置き換わっていた)が例。
- **キャンペーン記録**(`data/campaigns.json`は人が転記している): 終了日が近い・過ぎたものは、その社の価格ページを開いて後継が出ているか確かめる。出ていれば、ページの記載どおりに差し替える(併用可否などの条件の変更も反映し、`verifiedAt` は確かめた日にする)。出ていなければ記録を削除する。表示側は終了済みを自動で隠すが、終了から14日を過ぎると点検が落ちる。
- 取れない・読めないときは、古い値のまま、`notes` に何が取れなかったかを正直に書く。価格を推測・創作しない。IPやWAFによる遮断を回避する工夫(ヘッダの偽装、プロキシなど)はしない。
- **pushできないとき**(クラウドの担当向け): 2026年11月14日、日次ルーチンは変更を作ったのに「access denied by the git proxy … not in this session's authorized repository set」で公開できず、パッチを送るだけで終わった。作業を始める最初に、`add_repo` ツール(access: `push`)でこのリポジトリ(`xikoutaiguang-droid/gold-kaitori-compare`)を書き込み可能につなぐ。ツールが見つからない・つなげないときは、変更をコミットしてパッチを添付し、「GitHubの Settings → Applications → Claude → Repository access に gold-kaitori-compare を追加してください」とオーナーに伝えて終える。他の方法で認証を回避しない。
- 毎日赤くなり続ける点検を新しく足さない。常に赤い点検は読まれなくなる。落とすのは、読む人に影響が出るか、直さないと直らないものに限る。
