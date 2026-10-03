# ここにある証明書について

サーバが送ってくるべきなのに送ってこない**中間証明書**を置いてあります。
新しく信頼を足すためのものではありません。

## secom-passport-for-web-sr3.pem

リファスタ (kinkaimasu.jp) 用。

同サイトはTLSの握手でリーフ証明書しか送らず、中間証明書を省いている
(openssl s_client で6回接続して6回とも `Verify return code: 21
(unable to verify the first certificate)`)。ブラウザや curl は、証明書に
書かれた取得先(AIA)から足りない中間証明書を自分で取りに行くので表示できるが、
Node/OpenSSL はそれをしないため検証に失敗する。

    subject : C=JP, O=SECOM Trust Systems CO.,LTD., CN=SECOM Passport for Web SR 3.0 CA
    issuer  : C=JP, O=SECOM Trust Systems CO.,LTD., OU=Security Communication RootCA2
    notAfter: 2028-03-16
    sha256  : 59f8a94c11bcd19fd4e0f1ac4d394e37913ae5fb5862a25a8ecd167ba3b9a3a2
    取得元  : http://repo1.secomtrust.net/spcpp/pfw/pfwsr3ca/ca2-der.cer
              (kinkaimasu.jp のサーバ証明書の Authority Information Access が
               指している、発行元自身の公開リポジトリ)

発行元の `Security Communication RootCA2` は Node の既定のルート120件に
最初から入っている。つまりこのファイルは、本来サーバが送るはずだった
一枚を横から補うだけで、検証そのものは従来どおり既定のルートまで
繋がることを要求する。検証を緩めてはいない
(`rejectUnauthorized: false` や `NODE_TLS_REJECT_UNAUTHORIZED=0` は使わない)。

2028年3月に期限が切れる。その前にリファスタ側の設定が直っていれば、この
ファイルごと消してよい。`openssl s_client -connect kinkaimasu.jp:443
-servername kinkaimasu.jp` の `Verify return code` が 0 になっていれば直っている。
