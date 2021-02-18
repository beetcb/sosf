### sosf

**S**erverless **O**neDrive & **S**harePoint **F**unction.

或许是**国内**访问最快的 OneDrive **免服务器**图床程序(或视频床、音乐床、...床)，专为**世纪互联**用户打造

> 注：SharePoint 文档储存功能和 OneDrive 网盘类似，本说明将他们统称为 OneDrive。

### 特点

- 与现有免费图床服务的区别：我们有 OneDrive 😎，所以 sosf 可以托管任何文件(图片、视频、下载链接)，并且无储存空间限制(几乎，你甚至还可以用 SharePoint 扩展空间)

- 提供 API 接口，供二次开发：sosf 命名范围很广，肯定不能浪得虚名。因此我们提供了 API 接口来扩展应用功能，例如：<details><summary>一个列出 OneDrive 根目录所有文件的示例</summary>

  ```js
  const fetch = require('node-fetch')
  const { getToken, drive_api } = require('./api')

  async function handler() {
    /**
     * Grab access_token
     */
    const { access_token } = await getToken()
    /**
     * Using access_token to access graph api, drive_api is equivalent to the:
     * - `/sites/{site-id}/drive` in sharepoint
     * - `/me/drive` in onedrive
     */
    const res = await fetch(`${drive_api}/root/children`, {
      headers: {
        Authorization: `bearer ${access_token}`,
      },
    })
    if (res.ok) {
      return await res.json()
    }
  }

  exports.main = handler
  ```

  </details>

- 访问速度快：`sosf` 使用国内 Serverless 供应商提供的免费服务(一般带有 CDN)，访问国内的世纪互联，速度自然有质的飞跃

- CLI 配置，简单快速：微软 Graph 的授权过程比较麻烦，为此我提供了一个 cli 工具来加快部署。用户填入所有的配置项后，该工具自动写入配置文件，无需多余操作

- 设计从简：`sosf` 只验证并获取 Onedrive 文件直链，并重定向过去(这也意味着它没有前端页面，如果你恰好有这种需求，[onedrive-cf-index](https://github.com/spencerwooo/onedrive-cf-index) 为不二之选)

- 教程完备：本说明带有十分叨唠的部署教程，各个平台都囊括其中

- <details>
     <summary>多平台部署支持：腾讯 TCB 、LeanCloud、Vercel</summary>

  - [Leancloud 云引擎开发版 (🎉)](https://www.leancloud.cn/engine/)：每天 1GB 外网出流量，`sosf` 流量消耗少，我相信 1GB 完全够用了。此外，公网访问必须绑定备案域名，详见 [定价](https://www.leancloud.cn/pricing/)；缺点是它有个[休眠策略](https://leancloud.cn/docs/leanengine_plan.html#hash643734278)

  - [腾讯云开发免费额度 (⚡)](https://cloud.tencent.com/product/tcb)：就速度而言它应该是最快的，缺点是每月有使用量限制 `执行内存(GB) * 执行时间(s)` 为 1000 GBs，云函数公网访问月流量限制为 1 GB，详见 [免费额度](https://cloud.tencent.com/document/product/876/39095)。如果你觉得服务不错，也可按量付费表示支持

  - [Vercel Serverless Func (🌸)](https://vercel.com/docs/serverless-functions/introduction)：它是国外服务器，速度不如前两家；不过国内访问速度也不错，不需要备案，免费额度也绝对够用：云函数使用量限制 `执行内存(GB) * 执行时间(h)` 为 100 GB-Hrs，月流量 100 GB, 详见 [Fair Use Policy](https://vercel.com/docs/platform/fair-use-policy)
  </details>

- 遵守[合理使用](https://vercel.com/docs/platform/fair-use-policy)规范：在我们使用这些云服务商表示支持的同时，也要~~优雅薅羊毛~~合理使用

### 部署指南

#### OneDrive 配置并授权

1. Azure 控制台顶栏搜索`应用注册`⇢ 新注册 ⇢ 受支持的账户类型填入`任何组织目录(任何 Azure AD 目录 - 多租户)中的帐户`⇢ 重定向 uri 填入 `http://localhost`⇢ 获取 `应用程序(客户端) ID (client_id)`

2. 授权

- OneDrive 用户左管理栏 API 权限 ⇢ 添加权限 `offine-access`、`files.read.all`、`files.read.write.all`⇢ 左管理栏证书和密码 ⇢ 创建并获取 `客户端密码 client-secret`
- SharePoint 用户左管理栏 API 权限 ⇢ 添加权限 `offine-access`、`sites.read.all`、`sites.read.write.all`⇢ 左管理栏证书和密码 ⇢ 创建并获取 `客户端密码 (client-secret)` ⇢ 创建并获取 client-secret 和以下两项额外参数:

  - hostName: 你的 SharePoint Host，比如 `cos.sharepoint.cn`
  - sitePath: 你的 SharePoint 网站相对位置，比如 `/sites/cos`

  比如我的 SharePoint 访问网址为 `https://odbeet.sharepoint.cn/sites/beet`，则 `hostName` 值为 `odbeet.sharepoint.cn`，`sitePath` 值为 `/sites/beet`，这是最快判断上述两者取值的方法

3. 得到上述配置参数后，请保存好留作后用

#### 云平台配置并部署

> 请在以下三种平台中任选其一: **云开发部署最方便(云开发版本无需数据库便可储存 access_token, 借力于 [`tcb-conf`](https://github.com/beetcb/tcb-conf) 项目)、leancloud 限制少速度快，vercel 限制最少**

##### 一. 腾讯云开发 tcb

> **未开通云开发&新注册用户**需要先开通云开发，具体过程为：在 [此地址](https://console.cloud.tencent.com/tcb?from=12335) 注册登录，完成后再进入 [开通地址](https://console.cloud.tencent.com/tcb?from=12335) 开通 ⇢ <span><input type="checkbox" disabled>不创建环境(请勾选)</span>，其它默认 ⇢ 跳转到授权界面并授权，开通成功 0. 点击此按钮一键部署：<br>

[![](https://main.qcloudimg.com/raw/67f5a389f1ac6f3b4d04c7256438e44f.svg)](https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fbeetcb%2Fsosf&branch=tcb-scf)

- [ ] 使用免费资源(记得勾选)

**注意**：直接部署计费模式为**按量计费**，如果你需要使用包月类型的免费额度，请首先进入云开发[控制台](https://console.cloud.tencent.com/tcb) ⇢ 空模板 ⇢ 确保选择计费方式`包年包月`, 套餐版本`免费版`(这样能够确保免费额度超出后不继续扣费，当然如果你觉得服务不错，请付费表示支持) ⇢ 然后点击**部署按钮**，选择已有环境为刚刚创建的环境

1. 本地获取机密环境变量：

   ```bash
   git clone -b tcb-scf https://github.com/beetcb/sosf.git && cd sosf
   npm i
   npm run auth
   # 在此根据提示开始配置
   ```

   配置完成后，sosf 会创建一个 `.env` 文件，内容大致如下：

   ![.env](https://i.imgur.com/iTGXe8I.png)

2. 进入刚刚创建的环境 ⇢ 左栏云函数 ⇢ 在线代码编辑器 ⇢ 将本地 `.env` 文件里的内容粘贴到在线编辑的 `.env` 文件中并保存，然后点击测试来自动配置环境变量，无报错则配置成功

3. 到此，应该部署成功了，如需自定义域名，请配置 [HTTP 访问服务](https://console.cloud.tencent.com/tcb/env/access?rid=4)。访问示例：`https://domain.com/path/to/file.md`

当然，我们也支持<details><summary>手动部署</summary>  
0. 配置机密环境变量：

```bash
git clone -b tcb-scf https://github.com/beetcb/sosf.git && cd sosf
npm i
npm run auth
# 在此根据提示开始配置
```

1. 进入云开发[控制台](https://console.cloud.tencent.com/tcb) ⇢ 空模板 ⇢ 按需选择计费方式，上文已经描述过 ⇢ 进入控制台

2. 环境总览下复制 环境 ID(envId) ⇢ 并改动本地代码中 `cloudbaserc.json` 中的 envId。然后在控制台基础服务栏数据库 ⇢ 新建集合(名为 sosf)

3. 安装 tcb cli 并授权登录：

   ```bash
   npm i -g @cloudbase/cli
   tcb login
   ```

4. 部署云函数：

   ```bash
   tcb fn deploy
   ```

5. 指定 HTTP 访问路径：
   ```bash
   tcb service create -p / -f sosf
   # 让函数在根目录触发
   ```
6. 等待几分钟，就可以开始预览了，访问示例：`https://your.app/path/to/file.md`
</details>

##### 二. Leancloud 云引擎

> leancloud 不支持导入模板应用，所以配置相对麻烦

0. 配置机密型环境变量：

   ```bash
   git clone -b leancloud https://github.com/beetcb/sosf.git && cd sosf
   npm i
   npm run auth
   # 在此根据提示开始配置
   ```

   配置完成后，sosf 会创建一个 `.env` 文件，内容大致如下：

   ![.env](https://i.imgur.com/iTGXe8I.png)

1. 注册 Leancloud 开发板并进入控制台
2. 创建开发版应用并进入应用管理界面
3. 左储存栏结构化数据 ⇢ 创建 `class` ⇢ 名称填入 `sosf`，其它默认 ⇢ 点击该 class 名称，右栏添加行 ⇢ 获取此行的 `ObjectId` 值(比如 `d1d037116a8d1c4ad56017e9`) ⇢ 在项目根目录 `.env` 文件里新增

   ```js
   dbId = 6017e9d1d037116a8d1c4ad5
   ```

   这一步是为了持久保存访问 graph 的 `access-token`，因为 serverless function 是无状态的

   此时 `.env` 状态大概是这样：

   ![.env db](https://i.imgur.com/XoSDuz6.png)

4. 安装 lean cli：[安装文档](https://leancloud.cn/docs/leanengine_cli.html#hash1443149115) ⇢ 登录 ⇢ 绑定 ⇢ 部署你的 sosf 项目

   ```bash
   lean login
   # 登录
   lean switch
   # 绑定
   lean deploy
   # 部署
   ```

5. 部署成功后，我们回到控制台，左设置栏域名绑定 ⇢ 在此绑定你的域名

6. 访问地址示例：`https://your.app/path/to/file.md`

##### 三. Vercel Serverless Func

0. 配置机密型环境变量：

   ```bash
   git clone -b vercel https://github.com/beetcb/sosf.git && cd sosf
   npm i
   npm run auth
   # 在此根据提示开始配置
   ```

1. 注册[国际 Leancloud 开发板](https://console.leancloud.app/)并进入控制台
2. 创建开发版应用并进入应用管理界面
3. 左储存栏结构化数据 ⇢ 创建 `class` ⇢ 名称填入 `sosf`，勾选`无限制`，其它默认 ⇢ 点击该 class 名称，右栏添加行 ⇢ 获取此行的 `ObjectId` 值(比如 `d1d037116a8d1c4ad56017e9`) ⇢ 左设置栏应用 keys，复制 Credentials 下的前两个参数的值(AppID AppKey) ⇢ 在项目根目录 `.env` 文件里新增这三项 key-value，例如：

   ```js
   dbId = d1d037116a8d1c4ad56017e9
   AppID = rrdYFdniaMdYXbMMIUGUusc64SMJTevMY
   AppKey = IkoR0JGItmcYnyAsqoySF7Fc
   ```

   同样，dbId 是为了持久保存访问 graph 的 `access-token`，因为 serverless function 是无状态的。而且由于我们在 vercel 里面访问 leancloud 的数据库，需要额外的验证值(AppID AppKey)

4. 安装 vercel cli 并登录：

   ```bash
   npm i -g vercel
   vercel login
   ```

5. 部署：

   ```bash
   vercel --prod
   # 按照提示完成部署
   ```

   到此部署完成，访问地址可以在命令行或 vercel 官网看到。需要使用自定义域名，请参考 [custom-domains](https://vercel.com/docs/custom-domains#)

6. 访问地址示例：`https://your.app/?path=/path/to/file.md`

### 作者

作者：[`beetcb`](https://www.beetcb.com)

邮箱: `i@beetcb.com`

### 鸣谢

- [Tencent tcb](https://github.com/TencentCloudBase)
- [LeanCloud](https://github.com/leancloud)
- [Vercel](https://github.com/vercel/vercel)

🌡 注意：受限于国内网络环境，本说明图片可能不能正常显示，或者你想查看部署的效果，请查看 [此篇博文](https://www.beetcb.com/posts/22/)
