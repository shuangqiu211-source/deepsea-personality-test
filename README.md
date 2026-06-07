# 深海人格测试

这是 GitHub Pages 可部署版本。封面图片已经放在：

```text
public/cover.png
```

代码里使用了 GitHub Pages 兼容路径：

```jsx
src={`${import.meta.env.BASE_URL}cover.png`}
```

所以部署到 GitHub Pages 后，封面图也可以正常显示。

## 上传方式

解压后进入 `deepsea-personality-test` 文件夹，上传里面的全部内容：

```text
.github
public
src
index.html
package.json
vite.config.js
README.md
```

注意：不要把 `App.jsx / data.js / main.jsx / styles.css / cover.png` 单独放在根目录。它们应该分别在：

```text
src/App.jsx
src/data.js
src/main.jsx
src/styles.css
public/cover.png
```

## 部署

1. 上传后进入 GitHub 仓库 Settings → Pages
2. Source 选择 GitHub Actions
3. 回到 Actions，等待 Deploy to GitHub Pages 运行成功
4. 回到 Pages 查看网页链接

## 本地运行

```bash
npm install
npm run dev
```
