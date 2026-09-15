# threads-link-resolver

Cloudflare Worker：接收 `?url=` 帶入 Threads 的 `/share/xxx` 短連結，回傳 `{ clean: "..." }`。

## 部署步驟

1. 註冊/登入 https://dash.cloudflare.com （免費方案即可）
2. 在這個 `worker` 資料夾底下執行：

   ```bash
   npx wrangler login
   npx wrangler deploy
   ```

   第一次 `wrangler login` 會開瀏覽器要你登入並授權。

3. 部署完成後，終端機會印出 Worker 網址，例如：

   ```
   https://threads-link-resolver.<你的 subdomain>.workers.dev
   ```

4. 把這個網址填回 `../index.html` 裡的 `RESOLVER_URL` 常數，取代 `WORKER_SUBDOMAIN`。
5. 如果你的 GitHub Pages 網址不是 `https://ad80352.github.io`，也要同步修改
   `src/index.js` 裡的 `ALLOWED_ORIGIN`。
