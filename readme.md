# waline-cli

`waline-cli`是一个用于一键独立部署的[Waline 评论系统](https://waline.js.org/)的命令行工具

## 安装

```bash
npm install -g waline-cli
```

## 使用方式

### 1. 初始化

```bash
waline init
```

执行该命令，选择 waline 评论系统的存储方式和填写环境变量（具体请查阅[waline 官方文档-多数据库支持](https://waline.js.org/guide/server/databases.html)）。初始化完成后，会在用户主目录生成`.waline-cli`文件夹，里面有`.env`文件，该文件记录当前使用的存储方式及其对应的环境变量，后面需要调整可直接修改，重启服务生效。

### 2. waline 服务相关操作

`waline-cli` 内部使用 `pm2` 进行管理，提供以下命令用于管理 waline 服务

```bash
# 启动服务
waline start

# 停止服务
waline stop

# 重启服务
waline restart

# 查看服务状态
waline status
```

### 3. 查看 waline 服务实时日志

```bash
waline log
```

日志文件保存在`.waline-cli/logs`目录下，需要时可以查看

## 参考

- 该项目参考于：https://github.com/loclink/waline-service
- `waline`官方文档：https://waline.js.org/
