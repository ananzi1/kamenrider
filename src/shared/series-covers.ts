/**
 * 假面骑士各系列封面图片映射
 *
 * 图片文件存放于 resources/ 目录
 * 系列名需与扫描器解析的 seriesName 匹配
 */

const COVERS: Record<string, string> = {
  '假面骑士时王': 'Zi-O_Poster.webp',
  '假面骑士W': 'W_Poster.webp',
  '假面骑士ea': 'Ex-Aid_Poster.webp'
}

/**
 * 根据系列名查找封面图片文件名（大小写不敏感）
 * @returns 图片文件名，未找到返回 null
 */
export function getCoverFile(seriesName: string): string | null {
  // 精确匹配
  if (COVERS[seriesName]) return COVERS[seriesName]
  // 大小写不敏感回退
  const key = Object.keys(COVERS).find(
    (k) => k.toLowerCase() === seriesName.toLowerCase()
  )
  return key ? COVERS[key] : null
}

/**
 * 检查是否有某系列的封面图片
 */
export function hasCover(seriesName: string): boolean {
  return getCoverFile(seriesName) !== null
}

export default COVERS
