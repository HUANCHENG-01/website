<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card cpu">
          <div class="stat-icon">
            <el-icon :size="40"><Cpu /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ cpuUsage.toFixed(1) }}%</div>
            <div class="stat-label">CPU 使用率</div>
          </div>
          <div class="stat-chart" ref="miniCpuChart"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card memory">
          <div class="stat-icon">
            <el-icon :size="40"><Coin /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ memoryUsage.toFixed(1) }}%</div>
            <div class="stat-label">内存使用率</div>
          </div>
          <div class="stat-chart" ref="miniMemoryChart"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card disk">
          <div class="stat-icon">
            <el-icon :size="40"><Folder /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ diskUsage.toFixed(1) }}%</div>
            <div class="stat-label">磁盘使用率</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card network">
          <div class="stat-icon">
            <el-icon :size="40"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ networkSpeed }}</div>
            <div class="stat-label">网络吞吐</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 系统信息卡片 -->
    <el-card class="info-card" v-if="systemInfo">
      <template #header>
        <div class="card-header">
          <el-icon><Monitor /></el-icon>
          <span>系统信息</span>
        </div>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="主机名">
          <el-tag>{{ systemInfo.hostname }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="平台">{{ systemInfo.platform }}</el-descriptions-item>
        <el-descriptions-item label="系统">{{ systemInfo.distro }}</el-descriptions-item>
        <el-descriptions-item label="内核">{{ systemInfo.release }}</el-descriptions-item>
        <el-descriptions-item label="CPU">{{ systemInfo.cpu.brand }}</el-descriptions-item>
        <el-descriptions-item label="核心数">{{ systemInfo.cpu.cores }} 核</el-descriptions-item>
        <el-descriptions-item label="架构">{{ systemInfo.arch }}</el-descriptions-item>
        <el-descriptions-item label="总内存">{{ formatMemory(systemInfo.memory?.total) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 主图表区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="main-chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>CPU 监控</span>
              <el-tag type="info" size="small" style="margin-left: auto;">实时</el-tag>
            </div>
          </template>
          <div ref="cpuGaugeChart" class="gauge-chart"></div>
          <div ref="cpuLineChart" class="line-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="main-chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Coin /></el-icon>
              <span>内存监控</span>
              <el-tag type="info" size="small" style="margin-left: auto;">实时</el-tag>
            </div>
          </template>
          <div ref="memoryGaugeChart" class="gauge-chart"></div>
          <div ref="memoryLineChart" class="line-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="main-chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Folder /></el-icon>
              <span>磁盘使用情况</span>
            </div>
          </template>
          <div ref="diskChart" class="disk-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="main-chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>网络流量监控</span>
              <el-tag type="success" size="small" style="margin-left: auto;">
                ↓{{ formatSpeed(networkRx) }} ↑{{ formatSpeed(networkTx) }}
              </el-tag>
            </div>
          </template>
          <div ref="networkChart" class="network-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- CPU 核心使用率 -->
    <el-card class="core-card" style="margin-top: 20px;" v-if="cpuCores.length > 0">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>CPU 核心使用率</span>
        </div>
      </template>
      <div ref="coreChart" class="core-chart"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Cpu, Coin, Folder, Connection, Monitor, DataAnalysis } from '@element-plus/icons-vue'

const systemInfo = ref(null)
const cpuUsage = ref(0)
const memoryUsage = ref(0)
const diskUsage = ref(0)
const networkSpeed = ref('0 KB/s')
const networkRx = ref(0)
const networkTx = ref(0)
const cpuCores = ref([])

const miniCpuChart = ref(null)
const miniMemoryChart = ref(null)
const cpuGaugeChart = ref(null)
const cpuLineChart = ref(null)
const memoryGaugeChart = ref(null)
const memoryLineChart = ref(null)
const diskChart = ref(null)
const networkChart = ref(null)
const coreChart = ref(null)

let miniCpuInstance = null
let miniMemoryInstance = null
let cpuGaugeInstance = null
let cpuLineInstance = null
let memoryGaugeInstance = null
let memoryLineInstance = null
let diskInstance = null
let networkInstance = null
let coreInstance = null
let socket = null

const cpuHistory = []
const memoryHistory = []
const networkRxHistory = []
const networkTxHistory = []
const timeHistory = []

const formatMemory = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(1)} ${units[i]}`
}

const formatSpeed = (bytes) => {
  if (!bytes) return '0 B/s'
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(1)} ${units[i]}`
}

const initCharts = () => {
  // 迷你折线图
  miniCpuInstance = echarts.init(miniCpuChart.value)
  miniMemoryInstance = echarts.init(miniMemoryChart.value)

  // 主图表
  cpuGaugeInstance = echarts.init(cpuGaugeChart.value)
  cpuLineInstance = echarts.init(cpuLineChart.value)
  memoryGaugeInstance = echarts.init(memoryGaugeChart.value)
  memoryLineInstance = echarts.init(memoryLineChart.value)
  diskInstance = echarts.init(diskChart.value)
  networkInstance = echarts.init(networkChart.value)
  coreInstance = echarts.init(coreChart.value)
}

const createGaugeOption = (value, title) => ({
  series: [{
    type: 'gauge',
    startAngle: 200,
    endAngle: -20,
    min: 0,
    max: 100,
    splitNumber: 10,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [
          { offset: 0, color: '#10b981' },
          { offset: 0.5, color: '#f59e0b' },
          { offset: 1, color: '#ef4444' }
        ]
      }
    },
    progress: {
      show: true,
      width: 20,
      roundCap: true
    },
    pointer: {
      show: false
    },
    axisLine: {
      lineStyle: {
        width: 20,
        color: [[1, 'rgba(255,255,255,0.1)']]
      },
      roundCap: true
    },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    title: {
      show: true,
      offsetCenter: [0, '30%'],
      fontSize: 14,
      color: '#909399'
    },
    detail: {
      valueAnimation: true,
      width: '60%',
      lineHeight: 40,
      borderRadius: 8,
      offsetCenter: [0, '-5%'],
      fontSize: 32,
      fontWeight: 'bold',
      formatter: '{value}%',
      color: value > 80 ? '#ef4444' : value > 50 ? '#f59e0b' : '#10b981'
    },
    data: [{ value: value.toFixed(1), name: title }]
  }]
})

const createLineOption = (data, color, title) => ({
  grid: {
    top: 10,
    right: 10,
    bottom: 20,
    left: 40
  },
  xAxis: {
    type: 'category',
    data: timeHistory.slice(-30),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 10, color: '#909399' }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { fontSize: 10, color: '#909399', formatter: '{value}%' }
  },
  series: [{
    type: 'line',
    data: data.slice(-30),
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 2, color },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: color + '40' },
          { offset: 1, color: color + '00' }
        ]
      }
    }
  }]
})

const updateMiniChart = (instance, data, color) => {
  instance.setOption({
    grid: { top: 5, right: 5, bottom: 5, left: 5 },
    xAxis: { type: 'category', show: false, data: data },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + '60' },
            { offset: 1, color: color + '00' }
          ]
        }
      }
    }]
  })
}

const updateDiskChart = (disk) => {
  if (!disk?.filesystems?.length) return

  const totalUsed = disk.filesystems.reduce((sum, fs) => sum + fs.used, 0)
  const totalSize = disk.filesystems.reduce((sum, fs) => sum + fs.size, 0)
  diskUsage.value = totalSize > 0 ? (totalUsed / totalSize) * 100 : 0

  diskInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}<br/>已用: ${formatMemory(p.value * 1024 * 1024 * 1024)}`
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#909399' }
    },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#1a1a2e',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: disk.filesystems.slice(0, 6).map((fs, idx) => ({
        name: fs.mount,
        value: (fs.used / 1024 / 1024 / 1024).toFixed(2),
        itemStyle: {
          color: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'][idx % 6]
        }
      }))
    }]
  })
}

const updateNetworkChart = () => {
  networkInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#333',
      textStyle: { color: '#fff' },
      formatter: (params) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${formatSpeed(p.value * 1024)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['下载', '上传'],
      textStyle: { color: '#909399' },
      top: 0
    },
    grid: {
      top: 40,
      right: 10,
      bottom: 20,
      left: 60
    },
    xAxis: {
      type: 'category',
      data: timeHistory.slice(-30),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { fontSize: 10, color: '#909399' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: {
        fontSize: 10,
        color: '#909399',
        formatter: (v) => formatSpeed(v * 1024)
      }
    },
    series: [
      {
        name: '下载',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10b98140' },
              { offset: 1, color: '#10b98100' }
            ]
          }
        },
        data: networkRxHistory.slice(-30)
      },
      {
        name: '上传',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f640' },
              { offset: 1, color: '#3b82f600' }
            ]
          }
        },
        data: networkTxHistory.slice(-30)
      }
    ]
  })
}

const updateCoreChart = () => {
  if (!cpuCores.value.length) return

  coreInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 10,
      right: 10,
      bottom: 30,
      left: 40
    },
    xAxis: {
      type: 'category',
      data: cpuCores.value.map((_, i) => `核心 ${i + 1}`),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { fontSize: 10, color: '#909399', rotate: 45 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { fontSize: 10, color: '#909399', formatter: '{value}%' }
    },
    series: [{
      type: 'bar',
      data: cpuCores.value.map(c => ({
        value: c.usage.toFixed(1),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: c.usage > 80 ? '#ef4444' : c.usage > 50 ? '#f59e0b' : '#10b981' },
              { offset: 1, color: c.usage > 80 ? '#dc2626' : c.usage > 50 ? '#d97706' : '#059669' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      })),
      barWidth: '60%'
    }]
  })
}

onMounted(async () => {
  initCharts()

  // 获取系统信息
  try {
    const res = await axios.get('/api/system/info')
    systemInfo.value = res.data
  } catch (e) {
    console.error('获取系统信息失败:', e)
  }

  // 初始化初始数据
  try {
    const [cpuRes, memRes, diskRes] = await Promise.all([
      axios.get('/api/system/cpu'),
      axios.get('/api/system/memory'),
      axios.get('/api/system/disk')
    ])

    cpuUsage.value = cpuRes.data.usage || 0
    memoryUsage.value = memRes.data.usagePercent || 0
    cpuCores.value = cpuRes.data.cores || []

    if (diskRes.data.filesystems) {
      const totalUsed = diskRes.data.filesystems.reduce((sum, fs) => sum + (fs.used || 0), 0)
      const totalSize = diskRes.data.filesystems.reduce((sum, fs) => sum + (fs.size || 0), 0)
      diskUsage.value = totalSize > 0 ? (totalUsed / totalSize) * 100 : 0
    }

    // 初始化图表
    cpuGaugeInstance.setOption(createGaugeOption(cpuUsage.value, 'CPU'))
    memoryGaugeInstance.setOption(createGaugeOption(memoryUsage.value, '内存'))
    updateDiskChart(diskRes.data)
    updateCoreChart()
  } catch (e) {
    console.error('获取初始数据失败:', e)
  }

  // WebSocket连接 - 使用代理路径
  socket = io({
    path: '/socket.io',
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('WebSocket 已连接')
    socket.emit('startMonitoring')
  })

  socket.on('connect_error', (err) => {
    console.error('WebSocket 连接失败:', err.message)
  })

  socket.on('monitoringData', (data) => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    cpuUsage.value = data.cpu.usage
    memoryUsage.value = data.memory.usagePercent
    cpuCores.value = data.cpu.cores || []

    cpuHistory.push(data.cpu.usage)
    memoryHistory.push(data.memory.usagePercent)
    timeHistory.push(timeStr)

    if (data.network.stats?.[0]) {
      networkRx.value = data.network.stats[0].rx_sec
      networkTx.value = data.network.stats[0].tx_sec
      networkRxHistory.push(data.network.stats[0].rx_sec / 1024)
      networkTxHistory.push(data.network.stats[0].tx_sec / 1024)

      const totalSpeed = networkRx.value + networkTx.value
      networkSpeed.value = formatSpeed(totalSpeed)
    }

    if (timeHistory.length > 60) {
      timeHistory.shift()
      cpuHistory.shift()
      memoryHistory.shift()
      networkRxHistory.shift()
      networkTxHistory.shift()
    }

    // 更新所有图表
    cpuGaugeInstance.setOption(createGaugeOption(cpuUsage.value, 'CPU'))
    memoryGaugeInstance.setOption(createGaugeOption(memoryUsage.value, '内存'))
    cpuLineInstance.setOption(createLineOption(cpuHistory, '#3b82f6', 'CPU'))
    memoryLineInstance.setOption(createLineOption(memoryHistory, '#8b5cf6', '内存'))
    updateMiniChart(miniCpuInstance, cpuHistory, '#3b82f6')
    updateMiniChart(miniMemoryInstance, memoryHistory, '#8b5cf6')
    updateDiskChart(data.disk)
    updateNetworkChart()
    updateCoreChart()
  })
})

onUnmounted(() => {
  if (socket) {
    socket.emit('stopMonitoring')
    socket.disconnect()
  }
  miniCpuInstance?.dispose()
  miniMemoryInstance?.dispose()
  cpuGaugeInstance?.dispose()
  cpuLineInstance?.dispose()
  memoryGaugeInstance?.dispose()
  memoryLineInstance?.dispose()
  diskInstance?.dispose()
  networkInstance?.dispose()
  coreInstance?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding-bottom: 20px;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-card.cpu { border-left: 4px solid #3b82f6; }
.stat-card.memory { border-left: 4px solid #8b5cf6; }
.stat-card.disk { border-left: 4px solid #10b981; }
.stat-card.network { border-left: 4px solid #f59e0b; }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.cpu .stat-icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.stat-card.memory .stat-icon { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
.stat-card.disk .stat-icon { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.stat-card.network .stat-icon { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-chart {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 80px;
  height: 50px;
  opacity: 0.6;
}

.info-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: none;
}

.info-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
}

.info-card :deep(.el-descriptions) {
  --el-fill-color-blank: transparent;
}

.info-card :deep(.el-descriptions__label) {
  color: #909399;
}

.info-card :deep(.el-descriptions__content) {
  color: #fff;
}

.main-chart-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: none;
}

.main-chart-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
}

.card-header .el-icon {
  color: #3b82f6;
}

.gauge-chart {
  height: 180px;
}

.line-chart {
  height: 120px;
}

.disk-chart {
  height: 300px;
}

.network-chart {
  height: 300px;
}

.core-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: none;
}

.core-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
}

.core-chart {
  height: 200px;
}

:deep(.el-card) {
  border-radius: 12px;
}
</style>
