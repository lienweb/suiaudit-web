# 🚀 SuiAudit Website

[![License](https://img.shields.io/github/license/lienweb/suiaudit-web)](./LICENSE)

<!-- [![Build Status](https://img.shields.io/github/actions/workflow/status/yourname/yourrepo/ci.yml)](https://github.com/yourname/yourrepo/actions)
[![npm version](https://img.shields.io/npm/v/your-package)](https://www.npmjs.com/package/your-package) -->

---

## 🛠 Features

- SuiAudit Official Website

---

## 📖 Quick Start

### Prerequisites

- Node.js >= 22.12
- pnpm

### 📦 Installation

```bash
git clone git@github.com:lienweb/suiaudit-web.git
cd website
pnpm install
pnpm build
```

### Start dev server

```bash
pnpm dev
```

### Deploy to Walrus Site

```bash
pnpm build
site-builder deploy ./out --epochs [day]
```

Update website:
`ws-resources.json` records object id, fill in and make sure to include it in new build `./out`

## 📜 License

Apache License 2.0, see [LICENSE](https://github.com/lienweb/suiaudit-web/blob/main/LICENSE).

---
