<template>
  <div class="container">
    <div class="page-header">
      <h2>容器管理</h2>
      <p class="subtitle">管理 Docker 容器，支持启动、停止、重启操作</p>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Box /></el-icon>
            <span>容器列表</span>
            <el-tag type="info" size="small">{{ containers.length }} 个容器</el-tag>
          </div>
          <el-button type="primary" @click="refreshList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-alert
        v-if="containerError"
        :title="containerError"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 20px;"
      >
        <template #default>
          <span>请确保 Docker 服务已启动且当前用户有访问权限</span>
        </template>
      </el-alert>

      <el-table
        :data="containers"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: 'rgba(255,255,255,0.02)' }"
      >
        <el-table-column prop="name" label="容器名称" min-width="180">
          <template #default="{ row }">
            <div class="container-name">
              <el-icon class="container-icon" :class="row.state">
                <Box />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="image" label="镜像" min-width="180">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.image }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" width="100">
          <template #default="{ row }">
            <div class="state-badge" :class="row.state">
              <span class="state-dot"></span>
              <span>{{ row.state }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="运行时间" width="150">
          <template #default="{ row }">
            <span class="status-text">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="端口映射" min-width="180">
          <template #default="{ row }">
            <div class="ports-list">
              <el-tag
                v-for="(port, idx) in row.ports.slice(0, 3)"
                :key="idx"
                size="small"
                type="info"
                class="port-tag"
              >
                {{ formatPort(port) }}
              </el-tag>
              <el-tag v-if="row.ports.length > 3" size="small" type="info">
                +{{ row.ports.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group class="action-buttons">
              <el-button
                type="success"
                size="small"
                plain
                @click="handleAction(row.id, 'start')"
                :disabled="row.state === 'running'"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
              <el-button
                type="warning"
                size="small"
                plain
                @click="handleAction(row.id, 'stop')"
                :disabled="row.state !== 'running'"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
              <el-button
                type="info"
                size="small"
                plain
                @click="handleAction(row.id, 'restart')"
              >
                <el-icon><RefreshRight /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && containers.length === 0 && !containerError" class="empty-state">
        <el-icon :size="48"><Box /></el-icon>
        <p>暂无容器</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Box, Refresh, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'

const containers = ref([])
const loading = ref(false)
const containerError = ref('')

const formatPort = (port) => {
  if (port.publicPort) {
    return `${port.publicPort}:${port.privatePort}/${port.type}`
  }
  return `${port.privatePort}/${port.type}`
}

const fetchContainers = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/container/list')
    containers.value = res.data.containers || []
    containerError.value = res.data.error || ''
  } catch (e) {
    containerError.value = '获取容器列表失败: ' + e.message
    ElMessage.error(containerError.value)
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  fetchContainers()
}

const handleAction = async (id, action) => {
  const actionText = {
    start: '启动',
    stop: '停止',
    restart: '重启'
  }

  try {
    await axios.post(`/api/container/${action}/${id}`)
    ElMessage.success(`容器${actionText[action]}成功`)
    setTimeout(fetchContainers, 500)
  } catch (e) {
    ElMessage.error(`操作失败: ${e.response?.data?.error || e.message}`)
  }
}

onMounted(() => {
  fetchContainers()
})
</script>

<style scoped>
.container {
  padding-bottom: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
}

.table-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: none;
  border-radius: 12px;
}

.table-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-weight: 500;
}

.header-icon {
  color: #3b82f6;
  font-size: 18px;
}

.container-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.container-icon {
  font-size: 16px;
  color: #64748b;
}

.container-icon.running {
  color: #10b981;
}

.state-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.state-badge.running {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.state-badge.exited {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.state-badge.paused {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.state-badge.running .state-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  color: #94a3b8;
  font-size: 13px;
}

.ports-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.port-tag {
  font-size: 11px;
}

.action-buttons .el-button {
  padding: 6px 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-state p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
