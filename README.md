# 个人主页网站

## 发布到互联网

这个项目已经可以部署到支持 Node.js 和持久磁盘的平台，例如 Render。

### Render 部署步骤

1. 把这个文件夹上传到 GitHub 仓库。
2. 打开 Render，新建 `Blueprint`。
3. 选择你的 GitHub 仓库。
4. Render 会读取 `render.yaml`，创建网站服务和 1GB 持久存储。
5. 部署完成后，Render 会给你一个 `https://...onrender.com` 的公网网址。

公网网址打开后，点击“编辑内容”保存的资料会写入持久存储；上传照片也会保存并展示给所有访问者。

注意：`render.yaml` 使用了持久磁盘配置，Render 可能要求选择支持磁盘的付费实例。如果你想完全免费发布，只能做静态展示，网页在线编辑和保存照片就需要换成数据库或第三方存储。

## 本机打开

双击 `start-site.bat`，保持弹出的窗口不要关闭。

然后用电脑上的普通浏览器打开：

```text
http://localhost:4174/index.html
```

如果 `127.0.0.1` 在某些内置浏览器里打不开，请用 `localhost`，并尽量使用 Edge、Chrome 或 Firefox。

## 给别人访问

别人需要和你的电脑在同一个 Wi-Fi 或局域网里，并且你的电脑要保持开机、`start-site.bat` 窗口保持运行。

让别人访问：

```text
http://你的电脑IPv4地址:4174/index.html
```

可以在 Windows 里运行 `ipconfig`，找到当前网络下的 `IPv4 地址`。

## 保存内容

网页里点击“编辑内容”后可以修改文字，点击“保存更改”会写入：

```text
data/profile.json
```

上传照片后，最新照片会保存到：

```text
assets/profile-photo.*
```
