import ora from 'ora'
import { run } from './index'

export async function installNPM() {
  const spinner = ora(`Begin npm installing...`)
  try {
    setTimeout(() => spinner.start(), 0)
    await run('npm', ['install'])

    spinner.succeed('npm installing completed')
  } catch (e) {
    console.error(`error happens: ${e}`)
  } finally {
    spinner.stop()
  }
}
