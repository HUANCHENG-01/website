<template>
  <div class="process">
    <div class="page-header">
      <h2>进程管理</h2>
      <p class="subtitle">监控系统运行中的进程，支持搜索和终止操作</p>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><List /></el-icon>
            <span>进程列表</span>
            <el-tag type="info" size="small">{{ processes.length }} 个进程</el-tag>
          </div>
          <div class="header-right">
            <el-input
              v-model="searchText"
              placeholder="搜索进程名称或PID"
              style="width: 240px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="refreshList" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredProcesses"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: 'rgba(255,255,255,0.02)' }"
      >
        <el-table-column prop="pid" label="PID" width="100" sortable>
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.pid }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="进程名称" min-width="250">
          <template #default="{ row }">
            <div class="process-name">
              <el-icon class="process-icon"><Document /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="memory" label="内存占用" width="140" sortable>
          <template #default="{ row }">
            <div class="memory-bar">
              <el-progress
                :percentage="getMemoryPercent(row.memory)"
                :stroke-width="6"
                :show-text="false"
                :color="getMemoryColor(row.memory)"
              />
              <span class="memory-text">{{ formatMemory(row.memory) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cpu" label="CPU %" width="100" sortable>
          <template #default="{ row }">
            <span :class="['cpu-value', getCpuClass(row.cpu)]">
              {{ row.cpu.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              plain
              @click="handleKill(row)"
            >
              <el-icon><Close /></el-icon>
              终止
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Search, Refresh, Document, Close } from '@element-plus/icons-vue'

const processes = ref([])
const loading = ref(false)
const searchText = ref('')

const filteredProcesses = computed(() => {
  if (!searchText.value) return processes.value
  const search = searchText.value.toLowerCase()
  return processes.value.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.pid.toString().includes(search)
  )
})

const maxMemory = computed(() => {
  return Math.max(...processes.value.map(p => p.memory || 0), 1)
})

const getMemoryPercent = (bytes) => {
  return Math.min((bytes / maxMemory.value) * 100, 100)
}

const getMemoryColor = (bytes) => {
  const percent = getMemoryPercent(bytes)
  if (percent > 70) return '#ef4444'
  if (percent > 40) return '#f59e0b'
  return '#10b981'
}

const getCpuClass = (cpu) => {
  if (cpu > 50) return 'high'
  if (cpu > 20) return 'medium'
  return 'low'
}

const formatMemory = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(1)} ${units[i]}`
}

const fetchProcesses = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/process/list')
    processes.value = res.data.processes
  } catch (e) {
    ElMessage.error('获取进程列表失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  fetchProcesses()
}

const handleKill = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要终止进程 "${row.name}" (PID: ${row.pid}) 吗？`,
      '警告',
      {
        confirmButtonText: '确定终止',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'dark-message-box'
      }
    )

    await axios.post('/api/process/kill', { pid: row.pid })
    ElMessage.success('进程已终止')
    fetchProcesses()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('终止进程失败: ' + e.message)
    }
  }
}

onMounted(() => {
  fetchProcesses()
})
</script>

<style scoped>
.process {
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

.header-right {
  display: flex;
  gap: 12px;
}

.process-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.process-icon {
  color: #64748b;
}

.memory-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.memory-text {
  font-size: 12px;
  color: #94a3b8;
}

.cpu-value {
  font-weight: 500;
}

.cpu-value.low { color: #10b981; }
.cpu-value.medium { color: #f59e0b; }
.cpu-value.high { color: #ef4444; }

:deep(.el-progress-bar__outer) {
  background: rgba(255, 255, 255, 0.1);
}
</style>
