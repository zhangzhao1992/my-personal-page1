# 个人主页网站

## 免费发布到互联网

这个项目现在按免费静态站点配置，可以部署到 Render Static Site、GitHub Pages、Netlify 或 Vercel。

### Render 部署步骤

1. 把这个文件夹上传到 GitHub 仓库。
2. 打开 Render，新建 `Blueprint`，或者新建 `Static Site`。
3. 选择你的 GitHub 仓库。
4. Render 会读取 `render.yaml`，创建免费静态站点。
5. 部署完成后，Render 会给你一个 `https://...onrender.com` 的公网网址。

公网网址打开后，所有人都会看到 `data/profile.json` 里的公开资料。

注意：免费静态站点没有服务器存储。网页里的“编辑内容”和“上传照片”只能保存在当前浏览器，用来预览。要让所有人看到最新内容，需要更新 `data/profile.json` 和照片文件后重新部署。

## 更新公开内容

公开文字内容在仓库根目录：

```text
profile.json
```

公开照片可以放在：

```text
assets/profile-photo.jpg
```

然后把 `profile.json` 里的 `photoUrl` 改成：

```json
"/assets/profile-photo.jpg"
```

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
