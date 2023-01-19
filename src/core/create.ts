import path from 'path'
import { prompt, type Question } from 'inquirer'
import { existsSync, mkdirSync, removeSync, readJSONSync } from 'fs-extra'
import { sync as cmdExistsSync } from 'command-exists'
import { CreateConstructOptions, TemplateConfig } from './types'
import {
  projectHasGit,
  globalHasGit,
  logger,
  run,
  gitClone,
  getTmpdir,
  cliSelect,
  copyFileWithVars,
} from 'src/utils'

/**
 * 1.输入项目名称（默认创建新目录，检查同名目录）d
 * 2.模板list选择（4选1） d
 * 2.git clone模板repo d
 * 3.根据repo中的元信息，命令行输入参数 d
 * 4.模板替换变量->完成模板初始化
 * 5.npm install
 */
export default class Creator {
  private _rootDir: string

  private _templates: TemplateConfig[] = []

  private _shouldInitGit: boolean

  private _targetTemplate: TemplateConfig | null = null

	private _fields: Record<string, any> = {}
  private _templateFields: Record<string, any> = {}

  private _templateTmpDir: string

  constructor(options: CreateConstructOptions) {
    const { pkgName, rootDir, git, templates, install } = options
    this._validTemplates(templates)
    this._rootDir = rootDir

		this._fields = {
			pkgName,
			install
		}
    this._templates = templates
    this._templateTmpDir = getTmpdir({ random: true, global: false })
    this._shouldInitGit = !!git
  }

  async run() {
    // 1. 创建目录
    if (!existsSync(this._rootDir)) {
      logger.info(`指定目录${this._rootDir}不存在，开始创建目录`)
      mkdirSync(this._rootDir)
    } else {
      logger.warn(`存在同名目录${this._rootDir}`)

      const { override } = await prompt({
        type: 'confirm',
        name: 'override',
        message: '是否覆盖',
        default: true,
      })
      if (!override) {
        process.exit(1)
      }
    }

    // 2. git init
    if (this.shouldInitGit()) {
      await this.initGit()
    }

    // 3. 选择模板
    const { template } = await prompt([
      {
        type: 'list',
        name: 'template',
        choices: this._templates.map((i) => ({
          name: `${i.name} (${i.label})`,
          value: i.name,
        })),
        default: this._templates[0].name,
        message: `Please select template`,
      },
    ])
    this._targetTemplate = this._templates.find((i) => i.name === template) as TemplateConfig

    // 4. 获得模板对应命令行参数
    const questions = this._targetTemplate.params
    if (questions) {
      this._templateFields = await prompt(this._getQuestions(questions))
    }
    // console.log(this._templateFields)

    // 5. git clone指定模板
    await this._downloadTemplate()

    // 6. 变量替换、copy到本地
    await this._generate()

    // 7. npm install
    await this.autoInstall()
  }

  shouldInitGit() {
    return globalHasGit() && !projectHasGit(this._rootDir) && this._shouldInitGit
  }

  async initGit() {
    logger.info(`Initializing git repository...`)
    await run('git', ['init'], {
      cwd: this._rootDir,
    })
  }

  private async _downloadTemplate() {
    if (!this._targetTemplate) {
      logger.printErrorAndExit('Template has not yet been selected.')
    }
    const { gitRepo, name } = this._targetTemplate as TemplateConfig

    await gitClone(gitRepo, this._templateTmpDir)

    process.on('exit', () => {
      removeSync(this._templateTmpDir)
    })
  }

  async autoInstall() {
		if (!this._fields.install) {
			logger.info('Skip auto install, you can handle it manually.')
			return
		}

		const choices = []
		if (cmdExistsSync('npm')) {
			choices.push({
				name: 'Use npm',
				value: 'npm'
			})
		}
		if (cmdExistsSync('yarn')) {
			choices.push({
				name: 'Use yarn',
				value: 'yarn'
			})
		}
		if (cmdExistsSync('pnpm')) {
			choices.push({
				name: 'Use pnpm',
				value: 'pnpm'
			})
		}
		const pkgManager = await cliSelect('Choose a package manager for installing', choices, 'npm')
		
		await this.installDeps(pkgManager)
	}

  async installDeps(pkgManager: string) {
		const args = pkgManager === 'yarn' ? [] : ['i']

    try {
      logger.info('Installing Dependencies, please wait...')
      await run(pkgManager, args, {
        cwd: this._rootDir,
        stdio: 'inherit',
      })
      logger.done('Installing Dependencies complete')
    } catch (error) {
      logger.error(`Installing Dependencies failed, the reason is as follows\n: ${error}.`)
    }
	}

  private async _generate() {
		const metaPath = path.join(this._templateTmpDir, this._targetTemplate?.metaDir ?? '')
		const metaInfo = readJSONSync(metaPath)
		console.log('metaInfo', metaInfo)

		const srcDir = path.join(this._templateTmpDir, this._targetTemplate?.templateDir ?? '')
		await copyFileWithVars(srcDir, this._rootDir, this._templateFields)

		logger.done('🎉Compete copy template.')
	}

  private _validTemplates(templates: TemplateConfig[]) {}

  private _getQuestions(params: NonNullable<TemplateConfig['params']>) {
    const questions: Question[] = []
    for (const field in params) {
      const config = params[field]
      questions.push({
        type: config.type ?? 'input',
        name: field,
        message: config.message,
        default: '',
      })
    }
    return questions
  }
}