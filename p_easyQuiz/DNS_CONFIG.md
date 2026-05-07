# DNS 配置指南 - shinefore.com → Cloudflare Pages

## 阿里云 DNS 配置

登录 https://dns.console.aliyun.com 添加以下记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| CNAME | quiz | cc66d882.easyquiz.pages.dev | 600 |
| CNAME | @ | cc66d882.easyquiz.pages.dev | 600 |

> 注意：如果主域名已存在A记录，只能添加一条CNAME，需删除原有记录或使用子域名如 quiz.shinefore.com

---

## Cloudflare 设置自定义域名

1. 访问 https://dash.cloudflare.com
2. 进入 **easyquiz** 项目 → **Custom domains**
3. 点击 **Add custom domain**
4. 输入 `quiz.shinefore.com` 或 `shinefore.com`
5. 按提示完成验证

---

## 访问测试

配置完成后访问：
- `https://quiz.shinefore.com` (子域名)
- 或 `https://shinefore.com` (如果主域名已配置)

---

## 如需使用主域名（shinefore.com）

如果 shinefore.com 已有其他记录无法添加 CNAME，可：
1. 将主域名流量通过 Cloudflare 代理（域名前加入 Cloudflare）
2. 或使用子域名 `quiz.shinefore.com`