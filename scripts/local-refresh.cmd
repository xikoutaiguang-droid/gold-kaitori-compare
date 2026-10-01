@echo off
rem この PC から価格を取り直して push する。中身は scripts\local-refresh.mjs にある。
rem タスク スケジューラへの登録:
rem   schtasks /create /tn "kin-hikaku 価格取得" /tr "C:\Users\User\projects\gold-kaitori-compare\scripts\local-refresh.cmd" /sc daily /st 10:30
rem 解除:
rem   schtasks /delete /tn "kin-hikaku 価格取得" /f
setlocal
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
cd /d "C:\Users\User\projects\gold-kaitori-compare"
node scripts\local-refresh.mjs
endlocal
