#!/bin/bash

echo "🐳 正在构建 Docker 镜像..."
docker build -t ncm-builder .

echo "📦 正在容器中编译 Ncm 二进制文件..."
# 运行容器并将生成的二进制文件挂载出来
# 我们实际上只需要 build 产物，但为了简单，我们让 docker run 执行 build 命令后（Dockerfile CMD），
# 或者我们可以使用 docker cp。
# 更稳健的方式是使用 docker run 挂载输出目录。

docker run --rm -v "$(pwd)/build/bin:/app/build/bin" ncm-builder

if [ -f "build/bin/ncm-linux" ]; then
    echo "🎉 构建成功！二进制文件位于 build/bin/ncm-linux"
else
    echo "❌ 构建似乎完成了，但没找到二进制文件，请检查日志。"
fi
