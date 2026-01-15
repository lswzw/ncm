package main

import (
	"context"
	"ncm/network"
)

// App struct
type App struct {
	ctx     context.Context
	scanner *network.Scanner
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		scanner: network.NewScanner(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetConnections 暴露给前端的方法
func (a *App) GetConnections() ([]network.ConnectionInfo, error) {
	return a.scanner.GetConnections()
}
