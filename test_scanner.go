//go:build ignore

package main

import (
	"fmt"
	"log"
	"ncm/network"
)

func main() {
	scanner := network.NewScanner()
	conns, err := scanner.GetConnections()
	if err != nil {
		log.Fatalf("扫描失败: %v", err)
	}

	fmt.Printf("%-25s %-25s %-15s %-10s %s\n", "本地地址", "远程地址", "状态", "PID", "进程名")
	fmt.Println(string(make([]byte, 85))) // 分隔线

	for _, c := range conns {
		fmt.Printf("%-25s %-25s %-15s %-10d %s\n", c.LocalAddr, c.RemoteAddr, c.Status, c.PID, c.Process)
	}
}
