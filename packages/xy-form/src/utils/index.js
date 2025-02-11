/**
 * 获取 options 对应 value 的 label
 * @param url
 */
export function getLabelByOptionsValue(value, options) {
  let list
  if (Array.isArray(value)) {
    list = value
  } else {
    list = [value]
  }
  return list.map((v) => options.find((d) => d?.value === v)?.label ?? v).join('、')
}

/**
 * 判断是否为空
 * @param value
 * @returns
 */
export function isNotEmpty(value) {
  if (Array.isArray(value)) {
    return Boolean(value.length)
  } else {
    return value !== void 0
  }
}
