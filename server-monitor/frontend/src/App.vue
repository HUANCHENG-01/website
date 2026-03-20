<template>
  <el-container class="app-container">
    <el-aside width="220px">
      <div class="logo">
        <el-icon :size="28"><Monitor /></el-icon>
        <span>服务器监控</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#fff"
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/process">
          <el-icon><List /></el-icon>
          <span>进程管理</span>
        </el-menu-item>
        <el-menu-item index="/container">
          <el-icon><Box /></el-icon>
          <span>容器管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-icon><Setting /></el-icon>
        <span>v1.0.0</span>
      </div>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { Monitor, Odometer, List, Box, Setting } from '@element-plus/icons-vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

.app-container {
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.el-aside {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo .el-icon {
  color: #3b82f6;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  padding: 10px;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%);
  color: #fff;
  font-weight: 500;
}

.sidebar-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: #3b82f6;
  border-radius: 0 4px 4px 0;
}

.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.el-main {
  background: transparent;
  padding: 24px;
  overflow-y: auto;
}

.el-main::-webkit-scrollbar {
  width: 6px;
}

.el-main::-webkit-scrollbar-track {
  background: transparent;
}

.el-main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.el-main::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 全局卡片样式 */
.el-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.el-card__header {
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 表格样式 */
.el-table {
  background: transparent !important;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.02);
  --el-table-row-hover-bg-color: rgba(59, 130, 246, 0.1);
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-text-color: #e2e8f0;
  --el-table-header-text-color: #94a3b8;
}

.el-table th.el-table__cell {
  background: rgba(255, 255, 255, 0.02);
}

/* 输入框样式 */
.el-input__wrapper {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.el-input__wrapper:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.el-input__wrapper.is-focus {
  border-color: #3b82f6;
}

.el-input__inner {
  color: #fff;
}

.el-input__inner::placeholder {
  color: #64748b;
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
}

/* 分页样式 */
.el-pagination {
  --el-pagination-bg-color: rgba(255, 255, 255, 0.05);
  --el-pagination-text-color: #94a3b8;
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.05);
  --el-pagination-button-color: #94a3b8;
  --el-pagination-hover-color: #3b82f6;
}

/* Tag 样式 */
.el-tag {
  border-radius: 6px;
}

/* Alert 样式 */
.el-alert {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.el-alert--warning .el-alert__title {
  color: #f59e0b;
}
</style>
