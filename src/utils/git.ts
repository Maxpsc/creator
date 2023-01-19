import { execSync } from 'child_process'
import ora from 'ora'
import { sync as cmdExistsSync } from 'command-exists'
import { run } from './index'
import { logger } from './logger'

export function globalHasGit(): boolean {
  return cmdExistsSync('git')
}

export function projectHasGit(cwd: string) {
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    return true
  } catch (err) {
    return false
  }
}

/** todo
 * clone仓库到本地，处理缓存
 */
export async function gitClone(gitUrl: string, targetDir: string, branch = 'master') {
  const spinner = ora(`👴Loading Remote Template from ${gitUrl}...`).start()
  try {
    await run('git', ['clone', gitUrl, '-q', '-b', branch, './'], {
      cwd: targetDir,
    })
		spinner.succeed(`Loading template successfully`)
  } catch (err) {
    logger.error(`Failed to download template repository ${gitUrl}，\n ${err}`)
    process.exit(1)
  }
}
