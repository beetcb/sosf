> 注：SharePoint 文档储存功能和 OneDrive 网盘类似，本说明将他们统称为 OneDrive

### sosf

**S**everless **O**neDrive & **S**harePoint **F**unction.

或许是国内最快的 OneDrive 图床程序，专为世纪互联用户打造

### 特点

- 访问速度快：`sosf` 使用国内 Severless 供应商提供的免费服务，访问国内的世纪互联，速度自然有质的飞跃
- 设计从简，遵守[合理使用](https://vercel.com/docs/platform/fair-use-policy)规范：`sosf` 只验证并获取 Onedrive 文件直链，并重定向过去。它无前端界面，充分节省流量
- cli 授权，简单快速：微软 Graph 的授权过程比较麻烦，为此我提供了一个 cli 工具来加快部署。用户填入所有的配置项后，该工具自动写入配置文件，无需多余操作
- 多平台部署支持：我把国内几家云服务做了对比，筛选出了相对适合的供应商：
  - [Leancloud 云引擎开发版](https://www.leancloud.cn/engine/)：限制是每天 1GB 外网出流量，`sosf` 流量消耗少，我相信 1GB 完全够用了。此外，公网访问必须绑定备案域名，详见 [定价](https://www.leancloud.cn/pricing/)。
  - [腾讯云开发免费额度](https://cloud.tencent.com/product/tcb)：它的限制就多了，首先云函数每月有使用量限制 `执行内存(GB) * 执行时间(s)` 为 1000 GBs，并且云函数公网访问月流量限制为 1 GB，详见 [免费额度](https://cloud.tencent.com/document/product/876/39095)。 所以我推荐使用 leancloud。

  除此之外，[Vercel](https://vercel.com/docs/serverless-functions/introduction) 国内访问速度也不错，不需要备案，免费额度也绝对够用：云函数使用量 360000 GBs，月流量 100 GB, 详见 [Fair Use Policy](https://vercel.com/docs/platform/fair-use-policy)(良心！🌸)

### 部署

0. Azure 应用注册，重定向 uri 填入 `http://localhost`，开启权限：
- OneDrive 用户 `offine-access`、`files.read.all`、`files.read.write.all`
  获取 client_id 和 client-secret 
- SharePoint 用户 `offine-access`、`sites.read.all`、`sites.read.write.all`
  获取 client_id、client-secret 和以下两项:
  - siteName: 你的 SharePoint 域名，比如 `cos.sharepoint.cn`
  - sitePath: 你的 SharePoint 网站相对位置，比如 `/sites/cos`

然后请 clone 本项目并运行 cli 来填入配置：
  ```bash
  git clone https://github.com/beetcb/sosf
  cd sosf && npm i
  npm run auth
  ```
