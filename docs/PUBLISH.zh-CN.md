# Everyday Wisdom 1.0.0 — 发布交接

## 本次准备的版本

- 名称：Everyday Wisdom
- 插件 ID：`everyday-wisdom`
- 版本和正式标签：`1.0.0`，不加 `v` 前缀
- 内容：英文 v0.4，366 条固定日期沉思，302 个可选问题
- 作者：the flying markhor，与已发布的 Everyday Classical Music 保持一致
- 仓库：[Eloliuyx/everyday-wisdom](https://github.com/Eloliuyx/everyday-wisdom)
- 正式默认分支：`main`；[1.0.0 正式版已发布](https://github.com/Eloliuyx/everyday-wisdom/releases/tag/1.0.0)
- 源码、文档和全部沉思：MIT，产品负责人已确认
- 最低 Obsidian：1.13.1（所用设置 API 的最低版本；该版本尚未单独实测）

发布说明见 [1.0.0.md](releases/1.0.0.md)，用户说明见 [README](../README.md)。安装包在 `dist/everyday-wisdom-1.0.0.zip`。

## 已完成与待补验证

用户已反馈 macOS 中主要流程跑通。已有 54 项自动测试；366 条内容经过逐条审读，修正三处措辞。正式包包含 MIT 和第三方声明，代码不会覆盖已经写入日记的沉思。

iOS、Android、最低版本、跨设备同步和详细大库压力测试尚未实测。Done 右下角修复已打包，用户还未明确反馈新版视觉验收结果。新的正式产品截图尚未取得。这些限制保留在测试报告中，不写成已通过。

## GitHub 发布已完成

1. 产品负责人已明确授权正式发布；上述测试范围和限制保留在公开说明中。
2. 已按产品负责人要求将仓库公开，代码和全部沉思统一采用 MIT，与 Everyday Classical Music 一致。正式默认分支为 `main`，`manifest.json` 版本为 `1.0.0`。
3. 已发布 GitHub Release，标签精确为 `1.0.0`。`main.js`、`manifest.json`、`styles.css` 三个独立附件齐全，另有 ZIP、许可证、第三方声明和校验文件。
4. 七个附件已通过匿名公开下载验证，校验值与本地及 GitHub 独立构建一致。

## Obsidian Community 提交

当前浏览器中的 Obsidian 账号已登录，并关联 GitHub eloliuyx。新增插件表单的仓库地址已填好，Owner 为 Myself；剩余两项开发者政策与维护承诺需要产品负责人亲自勾选，再点击 Submit。目前没有把填好表单记为已经提交或通过审核。

1. 打开 [Obsidian Community](https://community.obsidian.md)，登录你的 Obsidian 账号并连接 GitHub。
2. 在插件页面选择新增插件，仓库填写 `https://github.com/Eloliuyx/everyday-wisdom`。
3. Owner 选择维护该插件的个人或组织。核对名称、介绍和作者。
4. 阅读开发者政策，并由你确认持续维护或转交/移除插件的责任，再提交。
5. 查看自动审核结果；修复 Error，阅读 Warning。需要修改发布内容时增加版本号，并重新发布对应附件。
6. 审核阻断项解决后完成 Publish，并核对目录中实际可安装状态。
7. 最后在全新 vault 中从插件商店搜索、安装、启用，验证新建日记和 Backfill/Deletion。

GitHub Release 发布与 Obsidian 上架是两步。尚未完成官方提交，也不保证审核时间。

官方依据：[提交指南](https://docs.obsidian.md/plugins/releasing/submit-plugin)、[开发者政策](https://docs.obsidian.md/community-directory/developer-policies)、[账号与提交表单](https://docs.obsidian.md/community-directory/set-up-and-claim)。于 2026-09-24 UTC 核对。
