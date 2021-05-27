## sosf

**S**erverless **O**neDrive & **S**harePoint **F**unction.

或许是**国内**访问最快的 OneDrive **免服务器**图床程序(或视频床、音乐床、...床)，专为**世纪互联**用户打造

> 注：SharePoint 文档储存功能和 OneDrive 网盘类似，本说明将他们统称为 OneDrive。

## 特点

- 使用 [`sstore`](https://github.com/beetcb/sstore) 项目缓存 `access_token`，省去复杂的数据库配置和不必要带宽开销

- 与现有免费图床服务的区别：我们有 OneDrive 😎，所以 sosf 可以托管任何文件(图片、视频、下载链接)，并且无储存空间限制(几乎，你甚至还可以用 SharePoint 扩展空间)

- 提供 API 接口模块 [sor](./sor/)，良好的 DTS 支持，方便二次开发。
  例如：<details><summary>一个列出 OneDrive 根目录所有文件的示例</summary>

  ```js
  const { getToken, listChildren } = require('@beetcb/sor')

  async function handler() {
    const access_token = await getToken()
    const resource = await listChildren('/', access_token)
    if (resource) {
      return resource
    }
  }

  exports.main = handler
  ```

  </details>

- 访问速度快：`sosf` 使用国内 Serverless 供应商提供的免费服务(一般带有 CDN)，访问国内的世纪互联，速度自然有质的飞跃

- CLI 配置，简单快速：微软 Graph 的授权过程比较麻烦，为此我提供了一个 CLI 工具来加快部署。用户填入所有的配置项后，该工具自动写入配置文件，无需多余操作

- 设计从简：`sosf` 只验证并获取 Onedrive 文件直链，并重定向过去(为方便文件查找，前端提供了简单的文件查找列表界面，让你简单高效地查找文件并获取链接)

- 教程完备：本说明带有十分详细的部署教程，各个平台都囊括其中

- <details>
     <summary>多平台部署支持：腾讯云开发 、LeanCloud、Vercel</summary>

  - [Leancloud 云引擎开发版 (🎉)][leancloud-thanks]：每天 1GB 外网出流量，`sosf` 流量消耗少，我相信 1GB 完全够用了。此外，公网访问必须绑定备案域名，详见 [定价][leancloud-price]；缺点是它有个[休眠策略][leancloud-notice]

  - [腾讯云开发免费额度 (⚡)][tcb-console]：就速度而言它应该是最快的，缺点是每月有使用量限制 `执行内存(GB) * 执行时间(s)` 为 1000 GBs，云函数公网访问月流量限制为 1 GB，详见 [免费额度][tcb-price]。如果你觉得服务不错，也可按量付费表示支持

  - [Vercel Serverless Func (🌸)][vercel-func]：它是国外服务器，速度不如前两家；不过国内访问速度也不错，不需要备案，免费额度也绝对够用：云函数使用量限制 `执行内存(GB) * 执行时间(h)` 为 100 GB-Hrs，月流量 100 GB, 详见 [Fair Use Policy][fair-use]
  </details>

- 遵守[合理使用](fair-use)规范：在我们使用这些云服务商表示支持的同时，也要~~优雅薅羊毛~~合理使用

## 部署指南

### OneDrive 配置并授权

1. Azure 控制台顶栏搜索`应用注册`⇢ 新注册 ⇢ 受支持的账户类型填入`任何组织目录(任何 Azure AD 目录 - 多租户)中的帐户`⇢ 重定向 uri 填入 `http://localhost`⇢ 获取 `应用程序(客户端) ID (client_id)`

2. 授权

- OneDrive 用户左管理栏 API 权限 ⇢ 添加权限 `offine-access`、`files.read.all`、`files.read.write.all`⇢ 左管理栏证书和密码 ⇢ 创建并获取 `客户端密码 client-secret`
- SharePoint 用户左管理栏 API 权限 ⇢ 添加权限 `offine-access`、`sites.read.all`、`sites.read.write.all`⇢ 左管理栏证书和密码 ⇢ 创建并获取 `客户端密码 (client-secret)` ⇢ 创建并获取 client-secret 和以下两项额外参数:

  - hostName: 你的 SharePoint Host，比如 `cos.sharepoint.cn`
  - sitePath: 你的 SharePoint 网站相对位置，比如 `/sites/cos`

  比如我的 SharePoint 访问网址为 `https://odbeet.sharepoint.cn/sites/beet`，则 `hostName` 值为 `odbeet.sharepoint.cn`，`sitePath` 值为 `/sites/beet`，这是最快判断上述两者取值的方法

3. 得到上述配置参数后，请保存好留作后用

### 云平台配置并部署

> 请在以下三种平台中根据你的需求任选其一:

#### 一. 腾讯云开发 tcb

> **未开通云开发&新注册用户**需要先开通云开发，具体过程为：在 [此地址][tcb-console] 注册登录，完成后再进入 [开通地址][tcb-console] 开通 ⇢ <span><input type="checkbox" disabled>不创建环境(请勾选)</span>，其它默认 ⇢ 跳转到授权界面并授权，开通成功 0. 点击此按钮一键部署：<br>

[![][tcb-btn]][tcb-btn-link]

- [ ] 使用免费资源(记得勾选)

**注意**：直接部署计费模式为**按量计费** + 免费额度，如果你需要使用包月类型的免费额度，请参考手动部署教程： <details><summary>点击展开手动部署教程</summary>

0. 配置机密环境变量：

   ```bash
   git clone https://github.com/beetcb/sosf.git && cd platforms/cloudbase/sosf/
   npm i
   npm run auth
   # 在此根据提示开始配置
   ```

   配置完成后，该工具会创建一个 `.env` 文件，内容大致如下：

   ```text
   client_id = xxx
   client_secret = xxx
   redirect_uri = http://localhost
   auth_endpoint = https://login.partner.microsoftonline.cn/common/oauth2/v2.0
   refresh_token = 0.AAAAQnNGiYmnI0CvMoN0bxMYyyzk3YwiZepNl9MOI6F2AGAB
   drive_api = https://microsoftgraph.chinacloudapi.cn/v1.0/sites/xx.sharepoint.cn,b4df3221/drive
   ```

   **你可以在此增加配置项**，详见 [部署配置](#部署配置)

1. 进入云开发[控制台][tcb-console] ⇢ 空模板 ⇢ 确保选择计费方式`包年包月`, 套餐版本`免费版`(这样能够确保免费额度超出后不继续扣费，当然如果你觉得服务不错，请付费表示支持) ⇢ 进入控制台

2. 安装 tcb cli 并授权登录：

   ```bash
   npm i -g @cloudbase/cli
   tcb login
   ```

   此时需手动修改云开发[配置文件][tcb]中 envId 项为你的环境 ID

3. 部署云函数：

   ```bash
   tcb fn deploy
   ```

4. 指定 HTTP 访问路径：
   ```bash
   tcb service create -p / -f sosf
   # 让函数在根目录触发
   ```
5. 等待几分钟，就可以开始预览了，访问示例：`https://your.app/path/to/file.md`

</details>

0. 本地获取机密环境变量：

   ```bash
   git clone -b tcb-scf https://github.com/beetcb/sosf.git && cd platforms/cloudbase/sosf/
   npm i
   npm run auth
   # 在此根据提示开始配置
   ```

   配置完成后，该工具会创建一个 `.env` 文件，内容大致如下：

   ```text
   client_id = xxx
   client_secret = xxx
   redirect_uri = http://localhost
   auth_endpoint = https://login.partner.microsoftonline.cn/common/oauth2/v2.0
   refresh_token = 0.AAAAQnNGiYmnI0CvMoN0bxMYyyzk3YwiZepNl9MOI6F2AGAB
   drive_api = https://microsoftgraph.chinacloudapi.cn/v1.0/sites/xx.sharepoint.cn,b4df3221/drive
   ```

   **你可以在此增加配置项**，详见 [部署配置](#部署配置)

1. 进入刚刚创建的环境 ⇢ 左栏云函数 ⇢ 在线代码编辑器 ⇢ 将本地 `.env` 文件里的内容粘贴到在线编辑的 `.env` 文件中并保存，然后点击测试，无报错则配置成功

2. 到此，应该部署成功了，如需自定义域名，请配置 [HTTP 访问服务][tcb-http]。访问示例：`https://domain.com/path/to/file.md`

3. （可选）配置 GitHub 持续部署，更新功能更便捷：`fork` 本项目，在 Actions 栏下开启 `sosf` ，下一步需要配置部署机密，在 Settings -> Secrets -> 依次添加以下四个 Secrets：

   ```text
   DOTENV   之前生成的 .env 文件的内容
   ENVID    云开发 ENVID
   SECRETID 腾讯云的访问密钥 ID
   SECRETKEY   腾讯云的访问密钥 KEY
   ```

   ![github-actions][github-actions-secret]

   然后请通过 [push] 来测试，成功以后每次的 [push] 操作都会部署 sosf 到你的云开发环境

#### 二. Leancloud 云引擎

> TODO

#### 三. Vercel Serverless Func

> TODO

### 部署配置

你可以直接使用 `.env` 文件自定义配置如下内容：

```text
base_dir = 需要部署的根目录文件夹，默认为 /
access_key = 前端界面鉴权密钥，持有此密钥才能访问文件夹内容，默认为空
```

> 使用 access_key 访问前端列表的方法：https://static.beetcb.com?key={{access_key}}

## 作者

作者：[`beetcb`][beetcb]

邮箱: `i@beetcb.com`

`sosf` - Licensed under under [MIT][license]

## 鸣谢

- [Tencent CloudBase][tcb-thanks]
- [LeanCloud][leancloud-thanks]
- [Vercel][vercel-thanks]

[tcb-thanks]: https://github.com/TencentCloudBase
[leancloud-notice]: https://leancloud.cn/docs/leanengine_plan.html#hash643734278
[leancloud-thanks]: https://github.com/leancloud
[leancloud-price]: https://www.leancloud.cn/pricing/
[vercel-thanks]: https://github.com/vercel/vercel
[vercel-func]: https://vercel.com/docs/serverless-functions/introduction
[license]: https://github.com/beetcb/sosf/blob/tcb-scf/LICENSE
[beetcb]: https://www.beetcb.com
[tcb-http]: https://console.cloud.tencent.com/tcb/env/access?rid=4
[tcb]: ./cloudbaserc.json
[tcb-price]: https://cloud.tencent.com/document/product/876/39095
[tcb-console]: https://console.cloud.tencent.com/tcb
[tcb-btn]: https://main.qcloudimg.com/raw/67f5a389f1ac6f3b4d04c7256438e44f.svg
[tcb-btn-link]: https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fbeetcb%2Fsosf&branch=main
[fair-use]: https://vercel.com/docs/platform/fair-use-policy
[github-actions-secret]: https://i.imgur.com/sY9Vthc.png