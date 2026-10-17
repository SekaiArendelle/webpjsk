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

选歌页提供 EASY、NORMAL、HARD、EXPERT、MASTER 五档难度。游玩时点击/触摸判定线附近的对应轨道，或使用 `D`、`F`、`Space`、`J`、`K` 键从左到右击打。Flick 需要在触摸时滑动，或按 `Shift` 加对应按键；左侧按键对应左上方向，右侧按键对应右上方向，`Space` 对应正上方。Trace 只需在判定时刻保持触碰；长条需要沿轨迹移动，并根据终点标记松手、保持触碰或滑动。移动轨道的 Slide 请使用触摸或鼠标操作。右上角按钮可以暂停游戏并返回选歌。

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
    play-progress.tsx     按歌曲和难度保存本地通关状态
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
  ├─ 管理音频播放、暂停和结束
  └─ 将谱面交给 PlayChart 渲染
```

`routes` 只从 `repositories/index.ts` 获取接口类型约束后的实例。以后接入后端时，可以新增 `ApiSongRepository`，然后仅在该入口替换实现，不需要重新修改选歌页和游玩页。

## 添加本地歌曲

1. 在 `src/assets/songs/<song-id>/` 中加入曲绘、音频和谱面。
2. 在 `local-song-repository.ts` 的本地歌曲定义中添加元数据和各难度谱面路径。
3. 运行 `npm run build`，确认所有动态谱面和媒体资源都能被 Vite 收集。

谱面由带时间的事件组成：每个事件有唯一 ID、相对音乐起点的判定时间（毫秒）和音符。音符包含轨道起点（0～9）与宽度（1～10），可标记 Critical；Flick 可指定方向。Slide 由起点、中间控制点和终点组成，中间点可设置独立判定，终点可要求松手、保持触碰或 Flick；固定轨道的 Hold 是 Slide 的简化形式。Guide 使用相同的轨迹结构绘制，但不参与判定。同一判定时间的事件可以组成双押。画面和判定都使用音频的 `currentTime`。

现有十份谱面原本只有音符组，没有节拍或时间。它们目前通过 `createDemoChart` 按固定间隔重复原有编排，覆盖整首歌，**尚未逐曲校准节拍**。正式谱面可以直接构造 `Chart` 事件列表。需要支持服务器动态下发歌曲时，可将事件转换成 JSON，并在 Repository 内完成请求、校验与领域对象转换。
