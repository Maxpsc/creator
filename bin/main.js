#! /usr/bin/env node

'use strict'

const chalk = require('chalk')
const { program } = require('commander')
const minimist = require('minimist')
const leven = require('leven')

const { create, logger } = require('../dist/create-any.cjs.js')

const pkg = require('../package.json')

const defaultConfigPath = './config'

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .usage('<command> [options]')

program
  .command('create <package-name>')
  .description('create a project based on the configuration')
  .option('-d, --dir <directory>', 'The Directory where the project is generated', './')
  .option('-i, --install', 'Automatically install dependencies after downloading')
  .option('-c, --config <config-path>', 'The config file path', defaultConfigPath)
  .option('--no-git', 'Disable git init after downloading')
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      logger.info(
        `You provided more than one argument. The first one will be used as the app's name, the rest are ignored.`
      )
    }

    const { templates = [] } = require(options.config) || {}

    if (!templates.length) {
      logger.printErrorAndExit(`The creator config should have at least one template`)
    }

    create(name, {
      ...options,
      templates
    })
  })

// output help information on unknown commands
program.arguments('<command>').action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
  process.exitCode = 1
})

program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${chalk.cyan(`scaffold <command> --help`)} for detailed usage of given command.`
  )
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

enhanceErrorMessages('missingArgument', (argName) => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', (optionName) => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function enhanceErrorMessages(methodName, log) {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }

    this.outputHelp()
    console.log(`  ` + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name)

  let suggestion

  availableCommands.forEach((cmd) => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
