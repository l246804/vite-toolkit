export interface BaseModeMapping {
  dev: string
  prod: string
  test: string
}

export type _ModeMapping = Record<string, string>

export type ModeMapping<E extends _ModeMapping> = BaseModeMapping & E

export const BASE_MODE_MAPPING = {
  dev: 'development',
  prod: 'production',
  test: 'test'
} as Readonly<BaseModeMapping>
