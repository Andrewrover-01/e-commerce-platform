<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="true"
    :close-on-click-modal="true"
    width="520px"
    align-center
  >
    <slot :coupon="couponData">
      <div class="coupon-default">
        <el-image
          v-if="couponData.image"
          :src="couponData.image"
          fit="cover"
          class="coupon-image"
        />
        <h3 class="coupon-title">{{ couponData.title || '限时优惠券' }}</h3>
        <p class="coupon-amount">¥{{ couponData.amount || 0 }}</p>
        <p class="coupon-desc">满{{ couponData.threshold || 0 }}可用 · {{ couponData.expireAt || '长期有效' }}</p>
      </div>
    </slot>

    <template #footer>
      <slot name="footer">
        <el-button @click="dialogVisible = false">暂不领取</el-button>
        <el-button type="danger" @click="handleClaim">立即领取</el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  couponData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:visible', 'claim'])

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

function handleClaim() {
  emit('claim', props.couponData)
}
</script>

<style scoped>
.coupon-default {
  text-align: center;
}

.coupon-image {
  width: 100%;
  height: 180px;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-3);
}

.coupon-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-2);
}

.coupon-amount {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-price);
  line-height: 1;
  margin-bottom: var(--spacing-2);
}

.coupon-desc {
  color: var(--color-text-secondary);
}
</style>
