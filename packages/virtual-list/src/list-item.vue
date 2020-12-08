<template>
  <div ref="itemRef">
    <slot />
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, ref } from 'vue'

import useVItem from './useVItem'
import { itemProps } from './constants'

export default defineComponent({
  props: itemProps,
  setup(props) {

    const API = useVItem(props)

    return API
  },

})
</script>