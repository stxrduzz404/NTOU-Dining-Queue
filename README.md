# 海味候位｜海大餐廳排隊系統

以 Queue（佇列）資料結構製作的餐廳候位系統，核心規則是 FIFO：先登記的客人先被叫號。

## 網頁版怎麼使用

不需要安裝套件，直接用瀏覽器開啟 `index.html` 即可。

在 VS Code 中也可以：

1. 開啟整個 `NTOU-Dining-Queue` 資料夾。
2. 雙擊 `index.html`，使用瀏覽器開啟。
3. 如果已安裝 Live Server 擴充套件，可以在 `index.html` 上按右鍵，選擇 `Open with Live Server`。

候位資料使用瀏覽器的 localStorage 保存在目前電腦，不需要資料庫。不同瀏覽器的資料彼此獨立。

## 功能

- 登記姓名、手機、人數與用餐區域
- 自動產生 A001、A002… 候位號碼
- 叫下一位入座（front + pop）
- 查看下一位但不移除（front）
- 顯示全部候位名單
- 依號碼查詢前方組數
- 計算候位組數、人數與預估等待時間
- 保存操作紀錄與目前叫號
- RWD 手機／平板／電腦版面
- 表單驗證、鍵盤操作與清空確認

## 與老師 C++ 範例的對照

| C++ Queue 操作 | 網頁版行為 |
| --- | --- |
| `waiting.push(c)` | 登記候位，從隊伍尾端加入 |
| `waiting.front()` | 查看下一位 |
| `waiting.pop()` | 叫號入座後，移除最前面的客人 |
| 複製 queue 後逐筆讀取 | 顯示完整候位名單、查詢前方組數 |
| `waiting.empty()` | 無候位客人時停用叫號按鈕 |

## C++ 主控台版

`main.cpp` 是可編譯執行的主控台版本，加入了人數、區域、選單與輸入處理。

如果電腦已有 g++，可在終端機執行：

```powershell
g++ -std=c++17 -Wall -Wextra -o queue-system.exe main.cpp
.\queue-system.exe
```

也可以在 VS Code 按 `Ctrl + Shift + B`，選擇「編譯 C++ 候位系統」。

## 檔案說明

- `index.html`：網頁結構
- `styles.css`：介面與響應式樣式
- `app.js`：候位邏輯、資料保存與畫面更新
- `main.cpp`：C++ Queue 主控台版本
- `.vscode/tasks.json`：VS Code 的 g++ 編譯工作

## 重設方式

按畫面上的「清空候位」只會清除候位名單，號碼仍會繼續增加。若要完全重設所有資料，可在瀏覽器開發者工具的 Console 執行：

```js
localStorage.removeItem("ntou-dining-queue-v1");
location.reload();
```
