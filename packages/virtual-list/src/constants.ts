import type { PropType, InjectionKey } from 'vue'

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
  direction: Direction // h stands for horizontal, v stands for virtical, defaults to vertical
  data: Array<T>
  rowHeight: number
  cache: number
  type: VType
}

export interface VirtualListItemProps {
  direction: Direction
  id: string | number
}

export type IDType = string | number

export interface VirtualListInjection {
  setSize: (id: IDType, value: number) => void
  delSize: (id: IDType) => void
}

const directionProp = {
  type: String as PropType<Direction>,
  default: 'v',
}

export const listProps = {
  cache: {
    type: Number,
    default: 10,
  },
  direction: directionProp,
  data: {
    type: Array as PropType<Array<any>>,
    required: true,
  },
  // this will be needed no matter type is SIZED or UNSIZED
  // when type is SIZED, this value will be used as the size of the list item
  // when type is UNSIZED, this value will be used as the average size of the list item
  // the more accurate the this was given, the more the precise the calculation would be.
  rowHeight: {
    type: Number,
    required: true,
  },
  windowSize: {
    type: Number,
    required: true,
  },
  type: {
    type: String as PropType<VType>,
    required: true,
  },
}

export const itemProps = {
  direction: directionProp,
}

export const VirtualListInjectKey: InjectionKey<VirtualListInjection> = Symbol('virtual-list')
