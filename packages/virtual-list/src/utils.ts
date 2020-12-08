import { VType } from './constants'

export function findStartNode<T extends VType>(
  offset: number,
  type: T,
  itemCount: number,
  size: T extends VType.SIZED ? number : undefined,
  cachedSizes: T extends VType.UNSIZED ? number[] : undefined,
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
    if (cachedSizes[middle] <= offset && cachedSizes[middle + 1] > offset) {
      return middle
    }

    if (middle === start) return end
    else {
      // find a way to calculate size.
      if (cachedSizes[middle] <= offset) {
        start = middle
      } else {
        end = middle
      }
    }
  }

  return itemCount
}

export function findEndNode(
  startIdx: number,
  windowSize: number,
  itemCount: number,
) {
  return Math.min(startIdx + windowSize, itemCount)
}
