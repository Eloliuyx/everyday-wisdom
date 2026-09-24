# Everyday Wisdom 1.0.0 — 发布交接

## 本次准备的版本

- 名称：Everyday Wisdom
- 插件 ID：`everyday-wisdom`
- 版本和正式标签：`1.0.0`，不加 `v` 前缀
- 内容：英文 v0.4，366 条固定日期沉思，302 个可选问题
- 作者：the flying markhor，与已发布的 Everyday Classical Music 保持一致
- 仓库：[Eloliuyx/everyday-wisdom](https://github.com/Eloliuyx/everyday-wisdom)
- 正式默认分支：`main`；发布草稿在仓库的 [Releases 页面](https://github.com/Eloliuyx/everyday-wisdom/releases)
- 源码、文档和全部沉思：MIT，产品负责人已确认
- 最低 Obsidian：1.13.1（所用设置 API 的最低版本；该版本尚未单独实测）

发布说明见 [1.0.0.md](releases/1.0.0.md)，用户说明见 [README](../README.md)。安装包在 `dist/everyday-wisdom-1.0.0.zip`。

## 已完成与待补验证

用户已反馈 macOS 中主要流程跑通。已有 54 项自动测试；366 条内容经过逐条审读，修正三处措辞。正式包包含 MIT 和第三方声明，代码不会覆盖已经写入日记的沉思。

iOS、Android、最低版本、跨设备同步和详细大库压力测试尚未实测。Done 右下角修复已打包，用户还未明确反馈新版视觉验收结果。新的正式产品截图尚未取得。这些限制保留在测试报告中，不写成已通过。

## 从发布草稿到公开版本

1. 核对本次源码、安装包及上述测试范围，确认是否进入公开发布。
2. 将当前私有 GitHub 仓库改为公开，确认正式默认分支的 `manifest.json` 是 `1.0.0`。
3. 发布已准备的 GitHub Release 草稿，标签精确为 `1.0.0`。分别保留 `main.js`、`manifest.json`、`styles.css` 三个附件；ZIP 不能代替它们。许可证、第三方声明和校验文件也已准备。
4. 核对公开仓库及附件可下载，且发布源码与构建包一致。

## Obsidian Community 提交

1. 打开 [Obsidian Community](https://community.obsidian.md)，登录你的 Obsidian 账号并连接 GitHub。
2. 在插件页面选择新增插件，仓库填写 `https://github.com/Eloliuyx/everyday-wisdom`。
3. Owner 选择维护该插件的个人或组织。核对名称、介绍和作者。
4. 阅读开发者政策，并由你确认持续维护或转交/移除插件的责任，再提交。
5. 查看自动审核结果；修复 Error，阅读 Warning。需要修改发布内容时增加版本号，并重新发布对应附件。
6. 审核阻断项解决后完成 Publish，并核对目录中实际可安装状态。
7. 最后在全新 vault 中从插件商店搜索、安装、启用，验证新建日记和 Backfill/Deletion。

GitHub Release 发布与 Obsidian 上架是两步。尚未完成官方提交，也不保证审核时间。

官方依据：[提交指南](https://docs.obsidian.md/plugins/releasing/submit-plugin)、[开发者政策](https://docs.obsidian.md/community-directory/developer-policies)、[账号与提交表单](https://docs.obsidian.md/community-directory/set-up-and-claim)。于 2026-09-24 UTC 核对。
