<template>
  <div class="promotion-tags">
    <el-tag
      v-for="tag in tags"
      :key="tag.type"
      :type="getTagType(tag.type)"
      :effect="getTagEffect(tag.type)"
      class="promotion-tag"
    >
      <span>{{ getTagIcon(tag.type) }}</span>
      <span>{{ tag.text }}</span>
    </el-tag>
  </div>
</template>

<script setup>
defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})

function getTagType(type) {
  const types = {
    flash: 'danger',
    discount: 'warning',
    gift: 'success',
    full_reduction: 'primary',
    new: 'info'
  }
  return types[type] || 'default'
}

function getTagEffect(type) {
  return type === 'flash' ? 'dark' : 'light'
}

function getTagIcon(type) {
  const icons = {
    flash: '🔥',
    discount: '💰',
    gift: '🎁',
    full_reduction: '🎯',
    new: '✨'
  }
  return icons[type] || '🏷️'
}
</script>

<style scoped>
.promotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.promotion-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 8px;
}
</style>
