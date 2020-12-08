<template>
  <div
    ref="viewportRef"
    class="el-vl__viewport"
    :style="viewportStyle"
    @scroll.passive="onScroll"
  >
    <div class="el-vl__content" :style="contentStyle">
      <div class="el-vl__item-container" :style="itemContainerStyle">
        <div v-for="(item, idx) in window" :key="idx + state.startNode" :style="itemStyle">
          <slot :item="item">{{ idx }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
import useVirtualScroll from './useVirtualScroll'
import { listProps } from './constants'

export default defineComponent({
  name: 'ElVirtualList',
  props: listProps,
  setup(props) {
    // init here

    const api = useVirtualScroll(props)

    // onMounted(() => {

    // })

    return api
  },
})
</script>
<style scoped>
</style>
