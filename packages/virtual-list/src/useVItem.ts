import { ref, onUpdated, onBeforeMount, inject, watch } from 'vue'
import { $ } from '@element-plus/utils/util'
import { VirtualListInjectKey } from './constants'

import type { VirtualListItemProps } from './constants'

export default function(props: VirtualListItemProps) {
  const size = ref(0)
  const itemRef = ref<HTMLElement>()
  const sizeKey = ref(`client${
    props.direction === 'h'
    ? 'Width'
    : 'Height'
 }`)

 const { setSize, delSize } = inject(VirtualListInjectKey)

  onUpdated(() => {
    size.value = $(itemRef)[$(sizeKey)]
    // id must be unique unless there will be overriding
    setSize(props.id, size.value)
  })

  onBeforeMount(() => {

  })

  watch(() => props.id, val => {
    delSize(val)
  })

  return {
    size,
    itemRef,
  }
}