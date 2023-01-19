import { DistinctQuestion } from 'inquirer'

export interface TemplateConfig {
  name: string
  label: string
  gitRepo: string
  templateDir: string
  metaDir: string
  params?: Record<string, DistinctQuestion>
}

export interface CreateBinOptions {
  dir: string
  git?: boolean
  install?: boolean
  templates: TemplateConfig[]
}

export interface CreateConstructOptions extends CreateBinOptions {
  pkgName: string
  rootDir: string
}
