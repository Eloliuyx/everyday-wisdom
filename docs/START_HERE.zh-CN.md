# Everyday Wisdom — 当前版本与试用方法

当前 **1.0.0 已在 GitHub 正式发布**，采用英文内容 v0.4。源码与全部沉思已采用 MIT 公开。用户已反馈 macOS 中主要流程跑通；手机端及最低版本等详细验收仍未完成。Obsidian 社区上架尚未完成，具体材料见 [发布交接](PUBLISH.zh-CN.md)。

## 现在已经能做什么

- 按日记日期选出固定的一条沉思，共 366 条，含 2 月 29 日。
- Settings 中开启 Automatic insertion 后，新建日记自动添加；关闭后不再添加，已经写入的文字保留。
- 打开已有日记（包括今天）或重启应用都不补入；没有单篇手动添加入口。
- 防重复、保留属性和正文；可选择放在顶部或底部。
- 按日期范围补齐已有日记；预览、确认之后执行，可以中途停止。
- 批量移除本插件生成的完整段落；用户改写过的内容保留。移除时默认同时关闭自动添加。
- 完全离线运行，无账号或后台网络请求。

## 最省事的试用方式

本地项目：`~/Documents/obsidian-code/everyday-wisdom`

1. 在 Obsidian 的库管理页面选择 **Open folder as vault / 打开本地仓库**。
2. 选择项目下面的 **test-vault** 文件夹。这是单独准备的测试库。
3. 如有提示，允许该测试库使用社区插件，再启用 **Everyday Wisdom**。
4. 在插件设置里开启 **Automatic insertion**，再新建一篇 Daily Note。应该看到：属性 → 该日期的沉思 → 日记正文。如果今天的文件已经存在，打开它不会补入。
5. 再次打开，检查没有重复插入。
6. 关闭开关后再新建另一篇日记，确认不再添加；原有沉思仍保留。测试库里的历史日记和闰日日记可用 Backfill、Deletion 试用。

安装 ZIP 在 `dist/everyday-wisdom-1.0.0.zip`。若要装进其他测试库，把压缩包里的 `everyday-wisdom` 文件夹放进该库的 `.obsidian/plugins/`，随后在 Obsidian 启用插件即可。

更新测试库内的插件后，在社区插件设置里将 Everyday Wisdom 关闭再开启，加载新版。

## 一个开关控制日常使用

在插件 Settings 中开启 **Automatic insertion**，之后新建的 Daily Note 自动带上沉思。关闭开关只停止后续添加，不删除已有文字。开关状态会保存。

单篇手动插入功能已取消：正文右键菜单、文件列表、命令面板和快捷键列表都不再注册 Insert reflection。开启开关、打开已有日记或重启应用都不会自动补齐旧笔记；需要时使用下面的 Backfill。

**Backfill** 用于补齐已有日记中缺少的沉思；**Deletion** 用于删除本插件生成且未被改写的沉思，不删除日记文件。两者都有预览和确认。

底部的 **Feed the Markhor 🦌🪽** 与 Everyday Classical Music 使用相同的居中、无边框布局，点击后打开 `https://ko-fi.com/flyingmarkhor`。

## 为什么源文件里有 start / end 标记

它们是防重复和安全清理需要的识别标记，并不是测试版提示。新版在 **Live Preview（实时预览）** 隐藏完整的标记行，已插入的旧条目也适用；Reading view（阅读视图）不显示 HTML 注释。Source mode（源码模式）仍显示原始文本。损坏的标记会保留可见，以便检查。该显示调整不改写日记。

## 验证情况

自动检查覆盖日期、闰年、正文保护、未保存编辑、重复触发、模板延迟、预览后改动、取消和读写失败。检查通过不等于已在真实应用中验收。

用户已反馈主要流程跑通，并提供了 Deletion 成功完成的截图。最新工具检查仍未建立界面控制连接，命令行无法定位运行中的应用；因此没有新增实机截图。iOS、Android 和最低版本尚未实测。完整测试清单见 [TESTING.md](TESTING.md)。

## 上线之前还有什么

1. 完成桌面、最低版本和 iOS/Android 实测，记录结果并取得真实截图。
2. 已完成 366 条内容的逐条审读。作者沿用 the flying markhor；产品负责人已确认代码和全部文字统一采用 MIT。
3. GitHub 仓库已公开，`1.0.0` 正式版本及附件已发布并验证可下载。
4. Obsidian Community 已登录、关联 GitHub 并填好表单；由产品负责人亲自确认政策和维护承诺后提交，再处理审核结果。
5. 在全新库中从社区插件目录安装，完成最终验收。

GitHub 仓库已公开开源：[Eloliuyx/everyday-wisdom](https://github.com/Eloliuyx/everyday-wisdom)。完整开发与上架步骤见 [开发计划](DEVELOPMENT_PLAN.zh-CN.md)，准确阶段状态见 [发布就绪报告](RELEASE_READINESS.md)。
