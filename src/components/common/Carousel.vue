<template>
  <div
    class="carousel"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <!-- 滑动轨道 -->
    <div class="carousel-track-wrap">
      <div
        class="carousel-track"
        :style="{ transform: `translateX(-${current * 100}%)` }"
      >
        <div
          v-for="(slide, idx) in slides"
          :key="idx"
          class="carousel-slide"
        >
          <a
            v-if="slide.link"
            :href="slide.link"
            class="slide-link"
            :aria-label="slide.alt || `轮播图 ${idx + 1}`"
          >
            <img
              :src="slide.image"
              :alt="slide.alt || ''"
              class="slide-img"
              :loading="idx === 0 ? 'eager' : 'lazy'"
            />
            <div v-if="slide.title || slide.subtitle" class="slide-caption">
              <p v-if="slide.title" class="slide-title">{{ slide.title }}</p>
              <p v-if="slide.subtitle" class="slide-subtitle">{{ slide.subtitle }}</p>
            </div>
          </a>
          <div v-else class="slide-link">
            <img
              :src="slide.image"
              :alt="slide.alt || ''"
              class="slide-img"
              :loading="idx === 0 ? 'eager' : 'lazy'"
            />
            <div v-if="slide.title || slide.subtitle" class="slide-caption">
              <p v-if="slide.title" class="slide-title">{{ slide.title }}</p>
              <p v-if="slide.subtitle" class="slide-subtitle">{{ slide.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 左右箭头 -->
    <button
      v-if="showArrows && slides.length > 1"
      class="arrow arrow-prev"
      aria-label="上一张"
      @click="prev"
    >‹</button>
    <button
      v-if="showArrows && slides.length > 1"
      class="arrow arrow-next"
      aria-label="下一张"
      @click="next"
    >›</button>

    <!-- 圆点指示器 -->
    <div v-if="showDots && slides.length > 1" class="carousel-dots">
      <button
        v-for="(_, idx) in slides"
        :key="idx"
        class="dot"
        :class="{ active: idx === current }"
        :aria-label="`跳转到第 ${idx + 1} 张`"
        @click="goTo(idx)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  /** Array of slide objects: { image, alt?, link?, title?, subtitle? } */
  slides: {
    type: Array,
    required: true,
  },
  /** Auto-play interval in milliseconds (0 = disabled) */
  interval: {
    type: Number,
    default: 4000,
  },
  showArrows: {
    type: Boolean,
    default: true,
  },
  showDots: {
    type: Boolean,
    default: true,
  },
})

const current = ref(0)
let timer = null

function goTo(idx) {
  current.value = (idx + props.slides.length) % props.slides.length
}

function next() {
  goTo(current.value + 1)
}

function prev() {
  goTo(current.value - 1)
}

function startTimer() {
  if (props.interval > 0 && props.slides.length > 1) {
    timer = setInterval(next, props.interval)
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function pause() {
  stopTimer()
}

function resume() {
  startTimer()
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

// Restart timer when interval prop changes
watch(() => props.interval, () => {
  stopTimer()
  startTimer()
})
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: #f0f0f0;
  user-select: none;
}

/* ── 轨道 ── */
.carousel-track-wrap {
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
}

.slide-link {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 6;
  overflow: hidden;
  text-decoration: none;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── 文字蒙层 ── */
.slide-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-6) var(--spacing-8);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
}

.slide-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  line-height: var(--line-height-tight);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  margin-bottom: var(--spacing-1);
}

.slide-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.85;
}

/* ── 箭头 ── */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  opacity: 0;
}
.carousel:hover .arrow {
  opacity: 1;
}
.arrow:hover {
  background: rgba(0, 0, 0, 0.6);
}
.arrow-prev {
  left: var(--spacing-3);
}
.arrow-next {
  right: var(--spacing-3);
}

/* ── 圆点 ── */
.carousel-dots {
  position: absolute;
  bottom: var(--spacing-3);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-2);
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  padding: 0;
}
.dot.active {
  width: 24px;
  background: #fff;
}
.dot:hover {
  background: rgba(255, 255, 255, 0.9);
}
</style>
