# 使用 Debian 11 (Bullseye) 以确保 GLIBC 兼容性 (GLIBC 2.31)
FROM golang:1.22-bullseye

# 安装 Wails 所需的 Linux 依赖及 Windows 交叉编译工具
RUN apt-get update && apt-get install -y \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    build-essential \
    pkg-config \
    npm \
    mingw-w64

# 安装 Wails CLI
RUN go install github.com/wailsapp/wails/v2/cmd/wails@latest

# 设置工作目录
WORKDIR /app

# 复制依赖文件并下载
COPY go.mod go.sum ./
RUN go mod download

# 复制项目所有文件
COPY . .

# 创建多平台构建脚本
RUN echo '#!/bin/bash\n\
echo "🐧 Building Linux Binary..."\n\
wails build -platform linux/amd64 -o ncm-linux\n\
\n\
echo "🪟 Building Windows Binary..."\n\
wails build -platform windows/amd64 -o ncm-windows.exe -skipbindings\n\
' > /usr/local/bin/build-all && chmod +x /usr/local/bin/build-all

# 执行构建脚本
CMD ["/usr/local/bin/build-all"]
