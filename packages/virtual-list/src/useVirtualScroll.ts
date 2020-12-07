import { ref, computed, reactive, watch } from 'vue'
import { $ } from '@element-plus/utils/util'

export type Direction = 'h' | 'v'
export type TransformFrom = 'translateX' | 'translateY'
export type ScrollFromKey = 'scrollLeft' | 'scrollHeight'
export type ViewportSizeKey = 'scrollWidth' | 'scrollHeight'

export enum VType {
  SIZED = 'sized',
  UNSIZED = 'unsized',
}

export enum ScrollingDir {
  FORWARD = 'forward',
  BACKWARD = 'backward',
}
export interface ElVirtualScrollProps<T> {
  windowSize: number
  direction: 'h' | 'v' // h stands for horizontal, v stands for virtical, defaults to vertical
  data: Array<T>
  rowHeight: number
  cache: number
  type: VType
}




export default function useVirtualScroll<T>(props: ElVirtualScrollProps<T>) {
  const state = reactive({
    offset: 0,
    scrolllingDir: ScrollingDir.FORWARD,
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

  const startNode = computed(() => {
    return Math.max(0, Math.floor(state.offset / props.rowHeight) - props.cache)
  })

  const viewportStyle = computed(() => {
    return {
      height: `${props.windowSize}px`,
    }
  })

  const contentStyle = computed(() => {
    // make this dynamic
    return {
      height: `${props.data.length * props.rowHeight}px`,
    }
  })

  const itemContainerStyle = computed(() => {
    const _offset = $(startNode) * props.rowHeight
    return {
      transform: `${$(transformFromKey)}(${_offset}px)`,
    }
  })

  const itemStyle = computed(() => {
    return {
      height: `${props.rowHeight}px`,
    }
  })

  // actually rendering window = data[start ... end]
  const window = computed(() => {
    const size = Math.min(
      props.data.length - $(startNode),
      Math.ceil(props.windowSize / props.rowHeight + 2 * props.cache),
    )
    return props.data.slice($(startNode), $(startNode) + size)
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
      state.scrolllingDir = scrollingDir
    })
  }

  function backwarding(offset: number) {
    const newStartNode = findStartNode(offset, props.type, props.data.length, undefined)
    // should not change range if start doesn't exceed overs
    if (newStartNode > this.range.start) {
      return
    }

    // move up start by a buffer length, and make sure its safety
    const start = Math.max(newStartNode - props.cache, 0)
    state.startNode = start
    state.endNode = findEndNode(start)
  }

  function forwarding(offset: number) {
    let newStart: number
    const { data, rowHeight, cache } = props
    if (props.type === VType.SIZED) {
      newStart = findStartNode(offset, VType.SIZED, data.length, rowHeight)
    } else {
      newStart = findStartNode(offset, VType.UNSIZED, data.length, undefined)
    }
    // range should not change if scroll overs within buffer
    if (newStart < state.startNode + cache) {
      return
    }

    state.startNode = newStart
    state.endNode = findEndNode()

    this.checkRange(newStart, this.getEndByStart(newStart))
  }

  watch(
    () => [state.startNode, state.endNode],
    ([newStart, newEnd], [prevStart]) => {
      const { cache, data } = props
      const len = data.length

      // datas less than keeps, render all
      if (len <= cache) {
        newStart = 0
        newEnd = this.getLastIndex()
      } else if (newEnd - newStart < cache - 1) {
        // if range length is less than keeps, corrent it base on newEnd
        newStart = newEnd - cache + 1
      }

      if (prevStart !== newStart) {
        this.updateRange(newStart, newEnd)
      }
    },
  )

  return {
    viewportRef: ref(null),
    contentStyle,
    itemContainerStyle,
    itemStyle,
    startNode,
    viewportStyle,
    window,
    onScroll,
  }
}

function findStartNode<T extends VType>(
  offset: number,
  type: T,
  itemCount: number,
  size: T extends VType.SIZED ? number : undefined,
  sizes: number[],
) {

  if (offset <= 0) {
    return 0
  }

  if (type === VType.SIZED) {
    return Math.floor(offset / size)
  }

  let start = 0
  let end = itemCount - 1

  while (end !== start) {
    const middle = Math.floor((end - start) / 2 + start)

    // find a way to get sizes cached
    if (sizes[middle] <= offset && sizes[middle + 1] > offset) {
      return middle
    }

    if (middle === start) return end
    else {
      // find a way to calculate size.
      if (sizes[middle] <= offset) {
        start = middle
      } else {
        end = middle
      }
    }
  }

  return itemCount
}

function findEndNode(startNode: number, itemCount: number, sizes: number[]) {
  let endNode: number

  return endNode
}
