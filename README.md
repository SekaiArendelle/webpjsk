# webpjsk

一个使用 SolidJS 在浏览器中复刻 Project Sekai 选歌和音游界面的项目。

## 开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 页面路由

- `/select`：选歌页
- `/play/:songId?difficulty=expert`：游玩页

页面之间只通过 URL 传递稳定的歌曲 ID 和难度。游玩页会根据这些参数重新从歌曲仓库读取歌曲和谱面，因此直接刷新或分享游玩链接也可以恢复页面。

选歌页提供 EASY、NORMAL、HARD、EXPERT、MASTER 五档难度。游玩时可以点击/触摸轨道，或使用 `Space`、`D`、`F`、`J`、`K` 键触发判定效果；右上角按钮可以暂停游戏并返回选歌。

部署单页应用时，需要让服务器将未知页面路径回退到 `index.html`，否则直接访问 `/select` 或 `/play/...` 可能得到服务器的 404。

## 目录结构

```text
src/
  app.tsx                 路由表和顶层 Provider
  routes/                 页面级组件
    select.tsx
    play.tsx
  domain/                 与 UI、数据来源无关的领域类型
    song.ts
    difficulty.ts
    chart.ts
    notes.ts
  repositories/           页面访问歌曲数据的统一边界
    song-repository.ts    Repository 接口
    local-song-repository.ts
    index.ts              当前实现的唯一装配入口
  stores/                 跨页面但不应持久化到 URL 的会话状态
    play-session.tsx
  components/             可复用界面组件
  assets/songs/           当前本地歌曲、曲绘、音频和谱面
  utils/                  通用浏览器工具
```

## 数据流

```text
SelectRoute
  ├─ 从 SongRepository 读取歌曲目录
  ├─ 将当前选择写入 PlaySessionStore
  └─ 导航到 /play/:songId?difficulty=...

PlayRoute
  ├─ 从 URL 读取 songId 和 difficulty
  ├─ 通过 SongRepository 加载对应谱面
  ├─ 管理音频播放和销毁
  └─ 将谱面交给 PlayChart 渲染
```

`routes` 只从 `repositories/index.ts` 获取接口类型约束后的实例。以后接入后端时，可以新增 `ApiSongRepository`，然后仅在该入口替换实现，不需要重新修改选歌页和游玩页。

## 添加本地歌曲

1. 在 `src/assets/songs/<song-id>/` 中加入曲绘、音频和谱面。
2. 在 `local-song-repository.ts` 的本地歌曲定义中添加元数据和各难度谱面路径。
3. 运行 `npm run build`，确认所有动态谱面和媒体资源都能被 Vite 收集。

当前谱面仍然是 TypeScript 模块。需要支持服务器动态下发歌曲时，可以将谱面转换成 JSON，并在 Repository 内完成请求、校验与领域对象转换。
