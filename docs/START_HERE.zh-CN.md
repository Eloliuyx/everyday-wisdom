# Everyday Wisdom — 当前版本与试用方法

当前是 **1.0.0 开发预览版**，采用已选定的英文内容 v0.4。代码已经实现，尚未通过真实 Obsidian 桌面和手机验收，也尚未上架。

## 现在已经能做什么

- 按日记日期选出固定的一条沉思，共 366 条，含 2 月 29 日。
- 创建日记时自动添加；打开今天的日记时补入；单纯打开历史日记不自动写入。
- 手动添加、防重复、保留属性和正文；可选择放在顶部或底部。
- 按日期范围补齐已有日记；预览、确认之后执行，可以中途停止。
- 批量移除本插件生成的完整段落；用户改写过的内容保留。移除时默认同时关闭自动添加。
- 完全离线运行，无账号或后台网络请求。

## 最省事的试用方式

本地项目：`~/Documents/obsidian-code/everyday-wisdom`

1. 在 Obsidian 的库管理页面选择 **Open folder as vault / 打开本地仓库**。
2. 选择项目下面的 **test-vault** 文件夹。这是单独准备的测试库。
3. 如有提示，允许该测试库使用社区插件，再启用 **Everyday Wisdom**。
4. 使用 Daily notes 创建今天的日记。应该看到：属性 → 当天沉思 → 日记正文。
5. 再次打开，检查没有重复插入。
6. 测试库里有历史日记和闰日日记，可用手动插入、补齐和移除命令试用。

安装 ZIP 在 `dist/everyday-wisdom-1.0.0.zip`。若要装进其他测试库，把压缩包里的 `everyday-wisdom` 文件夹放进该库的 `.obsidian/plugins/`，随后在 Obsidian 启用插件即可。

更新测试库内的插件后，在社区插件设置里将 Everyday Wisdom 关闭再开启，加载新版。

## 手动插入和新的设置名称

先打开目标 Daily Note，按 **⌘P**，搜索 **Everyday Wisdom: Insert reflection**。也可以点设置页的 **Insert reflection**，或在左侧文件列表右键该日记，选择 **Insert reflection**。非日记文件不会被写入。

**Backfill** 用于补齐已有日记中缺少的沉思；**Deletion** 用于删除本插件生成且未被改写的沉思，不删除日记文件。两者都有预览和确认。

底部的 **Feed the Markhor 🦌🪽** 与 Everyday Classical Music 使用相同的居中、无边框布局，点击后打开 `https://ko-fi.com/flyingmarkhor`。

## 为什么源文件里有 start / end 标记

它们是防重复和安全清理需要的识别标记，并不是测试版提示。新版在 **Live Preview（实时预览）** 隐藏完整的标记行，已插入的旧条目也适用；Reading view（阅读视图）不显示 HTML 注释。Source mode（源码模式）仍显示原始文本。损坏的标记会保留可见，以便检查。该显示调整不改写日记。

## 验证情况

自动检查覆盖日期、闰年、正文保护、未保存编辑、重复触发、模板延迟、预览后改动、取消和读写失败。检查通过不等于已在真实应用中验收。

真实界面验证目前受环境限制：界面控制工具此前报告未获得权限；最新检测发现 Obsidian 已运行，但尚未启用命令行。iOS 和 Android 尚未实测。完整测试清单见 [TESTING.md](TESTING.md)。

## 上线之前还有什么

1. 完成桌面、最低版本和 iOS/Android 实测，记录结果并取得真实截图。
2. 最终通读内容，确认作者显示名与源码/文字的公开许可证。目前没有擅自授予公开再利用许可。
3. 确认发布材料，将 GitHub 仓库公开，发布 `1.0.0` 正式版本及附件。
4. 在 Obsidian Community 登录、连接 GitHub、提交项目，解决审核结果中的错误。
5. 在全新库中从社区插件目录安装，完成最终验收。

目前 GitHub 是私有开发仓库：[Eloliuyx/everyday-wisdom](https://github.com/Eloliuyx/everyday-wisdom)。完整开发与上架步骤见 [开发计划](DEVELOPMENT_PLAN.zh-CN.md)，准确阶段状态见 [发布就绪报告](RELEASE_READINESS.md)。
