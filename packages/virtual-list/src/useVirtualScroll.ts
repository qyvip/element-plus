import { ref, computed, reactive, watch, provide, onMounted, onBeforeMount } from 'vue'
import { $ } from '@element-plus/utils/util'
import { addResizeListener, removeResizeListener } from '@element-plus/utils/resize-event'
import { VType, ScrollingDir, VirtualListInjectKey } from './constants'
import { findStartNode, findEndNode } from './utils'

import type { ResizableElement } from '@element-plus/utils/resize-event'
import type {
  Direction,
  TransformFrom,
  ScrollFromKey,
  ViewportSizeKey,
  ElVirtualScrollProps,
  IDType,
} from './constants'

export default function useVirtualScroll<T>(props: ElVirtualScrollProps<T>) {
  const state = reactive({
    offset: 0,
    scrollingDir: ScrollingDir.FORWARD,
    startNode: 0,
    endNode: 0,
  })

  const transformFromKey = ref(
    `translate${props.direction === 'h' ? 'X' : 'Y'}` as TransformFrom,
  )
  const scrollFromKey = ref(
    `scroll${props.direction === 'h' ? 'Left' : 'Top'}` as ScrollFromKey,
  ) // maybe when ltr its Right / Top?
  const viewportSizeKey = ref(
    `scroll${props.direction === 'h' ? 'Width' : 'Height'}` as ViewportSizeKey,
  )
  const animationHandle = ref<number>(null)
  const viewportRef = ref<ResizableElement>(null)

  // const startNode = computed(() => {
  //   return Math.max(0, Math.floor(state.offset / props.rowHeight) - props.cache)
  // })

  const range = computed(() => {
    const { startNode } = state
    const { cache, windowSize, data } = props
    return [startNode, cache + findEndNode(startNode, windowSize, data.length)]
  })

  const cachedSizes = ref(new Map<string | number, number>())

  // const avgSize = computed(() => {
  //   return props.type === VType.SIZED ? props.rowHeight :
  // })

  const viewportStyle = computed(() => ({
    height: `${props.windowSize}px`,
  }))

  const contentStyle = computed(() => {
    // make this dynamic
    return {
      height: `${props.data.length * props.rowHeight}px`,
    }
  })

  const itemContainerStyle = computed(() => {
    const _offset = state.startNode * props.rowHeight
    return {
      transform: `${$(transformFromKey)}(${_offset}px)`,
    }
  })

  const itemStyle = computed(() => {
    return props.type === VType.SIZED ? {
      height: `${props.rowHeight}px`,
    } : undefined
  })

  // actually rendering window = data[start ... end]
  const window = computed(() => {
    const { startNode } = state
    const { windowSize, rowHeight, cache, data } = props
    const size = Math.min(
      data.length - startNode,
      Math.ceil(windowSize / rowHeight + 2 * cache),
    )
    return data.slice(startNode, startNode + size)
  })


  const onScroll = (e: Event) => {
    const handle = $(animationHandle)
    if (handle) {
      cancelAnimationFrame(handle)
    }

    animationHandle.value = requestAnimationFrame(() => {
      // get offset via `translateX` or translatelY`
      // when the orientation is rtl, scroll left will be 0 initially, if user scrolls from right to left
      // scroll left will be negative, now we do not consider situations like this.
      // _offset should always be greater or equal than 0.
      const _offset = (e.target as HTMLElement)[$(scrollFromKey)]
      console.log(_offset)

      const viewportVisibleSize = props.windowSize
      // get view port sizes via `clientHeight` or `clientWidth`
      const viewportTrueSize = (e.target as HTMLElement)[$(viewportSizeKey)]

      let scrollingDir: ScrollingDir
      if (_offset < state.offset) {
        scrollingDir = ScrollingDir.BACKWARD
        backwarding(_offset)
      } else {
        scrollingDir = ScrollingDir.FORWARD
        forwarding(_offset)
      }

      state.offset = _offset
      state.scrollingDir = scrollingDir
    })
  }

  function backwarding(offset: number) {
    const { type, data, cache, windowSize } = props
    const _cachedSize = Array.from(cachedSizes.value.values())
    const newStartNode = findStartNode(offset, type, data.length, undefined, _cachedSize)

    if (newStartNode > state.startNode) {
      return
    }

    const start = Math.max(newStartNode - cache, 0)
    state.startNode = start
    state.endNode = findEndNode(start, windowSize, data.length)
  }

  function forwarding(offset: number) {
    let newStart: number
    const { data, rowHeight, cache, windowSize } = props
    if (props.type === VType.SIZED) {
      newStart = findStartNode(offset, VType.SIZED, data.length, rowHeight, undefined)
    } else {
      const _cachedSizes = Array.from(cachedSizes.value.values())
      newStart = findStartNode(offset, VType.UNSIZED, data.length, undefined, _cachedSizes)
    }
    // range should not change if scroll overs within buffer
    if (newStart < state.startNode + cache) {
      return
    }

    const start = Math.max(newStart - cache, 0)

    state.startNode = start
    state.endNode = findEndNode(start, windowSize, data.length)

    this.checkRange(newStart, this.getEndByStart(newStart))
  }

  function setSize(id: IDType, size: number) {
    cachedSizes.value.set(id, size)
  }

  function delSize(id: IDType) {
    cachedSizes.value.delete(id)
  }


  provide(VirtualListInjectKey, {
    setSize,
    delSize,
  })

  // onMounted(() => {
  //   addResizeListener($(viewportRef), () => {}) // implement
  // })

  // onBeforeMount(() => {
  //   removeResizeListener($(viewportRef), () => {}) // implement
  // })

  // watch(
  //   () => [state.startNode, state.endNode],
  //   ([newStart, newEnd], [prevStart]) => {
  //     const { cache, data } = props
  //     const len = data.length

  //     // datas less than keeps, render all
  //     if (len <= cache) {
  //       newStart = 0
  //       newEnd = this.getLastIndex()
  //     } else if (newEnd - newStart < cache - 1) {
  //       // if range length is less than keeps, corrent it base on newEnd
  //       newStart = newEnd - cache + 1
  //     }

  //     if (prevStart !== newStart) {
  //       this.updateRange(newStart, newEnd)
  //     }
  //   },
  // )

  // watch(() => cachedSizes.value.size, val => {
  //   const { type, data } = props
  //   if (type === VType.SIZED) {
  //     if (val < Math.min(data.length, $(range)[1])) {

  //     }
  //   } else {

  //   }
  // })

  return {
    state,
    viewportRef,
    contentStyle,
    itemContainerStyle,
    itemStyle,
    // startNode,
    viewportStyle,
    window,
    onScroll,
  }
}
