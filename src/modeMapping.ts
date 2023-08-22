import type { Recordable } from '@rhao/types-base'

export interface BaseModeMapping {
  dev: string
  prod: string
  test: string
}

export interface ModeMapping extends Recordable<string> {}

export type ModeMappingKey<MM extends ModeMapping> = keyof MM | keyof BaseModeMapping

export const BASE_MODE_MAPPING = {
  dev: 'development',
  prod: 'production',
  test: 'test',
} as BaseModeMapping
