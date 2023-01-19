import path from 'path'
import os from 'os'
import { mkdirSync} from 'fs-extra'

export const PLATFORM = {
  WIN: 'win32',
  LINUX: 'linux',
  MAC: 'darwin',
}

export const TEMP_DIR = '.creator_tmp'


export function getTmpdir(config = { random: false, global: true }): string {
	const { random, global } = config
  let tmpdir

	if (global) {
    if (process.platform === PLATFORM.WIN) {
      tmpdir = os.tmpdir()
    } else {
      tmpdir = path.join(process.env.HOME || os.homedir(), TEMP_DIR)
			try {
        mkdirSync(tmpdir)
      } catch (err) {
        tmpdir = os.tmpdir()
      }
    }
  } else {
		tmpdir = process.cwd()
	}
		
  if (random) {
    const name = `cli-tmp-${Date.now()}-${Math.ceil(Math.random() * 1000)}`
    tmpdir = path.join(tmpdir, name)
  }

	mkdirSync(tmpdir)
	return tmpdir
}
