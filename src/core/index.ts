import chalk from 'chalk'
import path from 'path'
import { logger } from 'src/utils'
import Creator from './create'
import { CreateBinOptions } from './types'

export async function create(pkgName: string, options: CreateBinOptions) {
  const { dir } = options
  const rootDir = path.join(process.cwd(), dir, pkgName)

  logger.info(`Begin Creating ${pkgName} in ${rootDir}`)

  const creator = new Creator({
    ...options,
    rootDir,
    pkgName,
  })

  await creator.run()

  logger.done(`🎉  Created project ${chalk.green.bold(pkgName)} successfully.`)
}

export default create
