import execa from 'execa'

export function run(bin: string, args: any[], opts = {}) {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export * from './cli'
export * from './logger'
export * from './git'
export * from './file'
export * from './template'
