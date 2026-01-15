package network

import (
	"fmt"

	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

// ConnectionInfo 描述一个网络连接的详细信息
type ConnectionInfo struct {
	LocalAddr  string `json:"local_addr"`
	RemoteAddr string `json:"remote_addr"`
	Status     string `json:"status"`
	PID        int32  `json:"pid"`
	Process    string `json:"process"`
}

// Scanner 负责扫描网络连接
type Scanner struct{}

// NewScanner 创建一个新的扫描器
func NewScanner() *Scanner {
	return &Scanner{}
}

// GetConnections 获取当前所有 TCP/UDP 网络连接
func (s *Scanner) GetConnections() ([]ConnectionInfo, error) {
	connections, err := net.Connections("inet")
	if err != nil {
		return nil, fmt.Errorf("failed to get connections: %v", err)
	}

	var result []ConnectionInfo
	for _, conn := range connections {
		// 过滤本地环回地址，如果需要查看恶意连接，通常更关注外部连接
		// 但为了完整性，这里可以根据前端需求决定是否过滤。默认展示非空远程地址或监听状态。

		info := ConnectionInfo{
			LocalAddr:  fmt.Sprintf("%s:%d", conn.Laddr.IP, conn.Laddr.Port),
			RemoteAddr: fmt.Sprintf("%s:%d", conn.Raddr.IP, conn.Raddr.Port),
			Status:     conn.Status,
			PID:        conn.Pid,
		}

		// 处理 PID 为 0 的情况（通常是系统进程或权限不足）
		if conn.Pid > 0 {
			p, err := process.NewProcess(conn.Pid)
			if err == nil {
				name, err := p.Name()
				if err == nil {
					info.Process = name
				} else {
					info.Process = "Unknown"
				}
			} else {
				info.Process = "Access Denied"
			}
		} else {
			info.Process = "System/Unknown"
		}

		// 规范化远程地址，如果是监听状态，远程地址通常为 0.0.0.0:0
		if info.RemoteAddr == ":0" || info.RemoteAddr == "0.0.0.0:0" || info.RemoteAddr == "[::]:0" {
			info.RemoteAddr = "*"
		}

		result = append(result, info)
	}

	return result, nil
}
