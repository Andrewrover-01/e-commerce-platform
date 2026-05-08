<template>
  <div class="countdown-container">
    <div class="countdown-label">距结束</div>
    <div class="countdown-time">
      <div class="time-block">
        <span class="time-num">{{ hours }}</span>
        <span class="time-unit">时</span>
      </div>
      <span class="time-separator">:</span>
      <div class="time-block">
        <span class="time-num">{{ minutes }}</span>
        <span class="time-unit">分</span>
      </div>
      <span class="time-separator">:</span>
      <div class="time-block">
        <span class="time-num">{{ seconds }}</span>
        <span class="time-unit">秒</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  endTime: {
    type: [String, Number],
    required: true
  }
})

const now = ref(Date.now())
let timer = null

const remaining = computed(() => {
  const end = typeof props.endTime === 'string' ? new Date(props.endTime).getTime() : props.endTime
  const diff = Math.max(0, end - now.value)
  return diff
})

const hours = computed(() => {
  return String(Math.floor(remaining.value / (1000 * 60 * 60))).padStart(2, '0')
})

const minutes = computed(() => {
  return String(Math.floor((remaining.value % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
})

const seconds = computed(() => {
  return String(Math.floor((remaining.value % (1000 * 60)) / 1000)).padStart(2, '0')
})

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

watch(() => props.endTime, () => {
  now.value = Date.now()
})
</script>

<style scoped>
.countdown-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
}

.countdown-label {
  font-size: 14px;
  font-weight: 600;
}

.countdown-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.time-num {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.time-unit {
  font-size: 10px;
}

.time-separator {
  font-size: 18px;
  font-weight: 700;
  margin: 0 2px;
}
</style>
