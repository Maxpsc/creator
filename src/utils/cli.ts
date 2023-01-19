import { prompt, type ChoiceOptions } from 'inquirer'
import ora from 'ora'

export async function cliConfirm(message: string, defaultVal: boolean) {
	const { confirm } = await prompt({
    type: 'confirm',
    name: 'confirm',
    message,
    default: defaultVal,
  })
	return confirm
}

export async function cliSelect(message: string, choices: Array<string | ChoiceOptions>, defaultVal: string) {
	const { value } = await prompt({
    type: 'list',
    name: 'value',
    message,
		choices,
    default: defaultVal,
  })
  return value
}

export async function spin<T>(text: string, handler: (...args: any[]) => Promise<T>, opts?: {
	successText: string,
	failText: string,
	handlerArgs: any[]
}) {
	const spinner = ora(text).start()
	const nOpts = {
		successText: text,
		failText: text,
		handlerArgs: [],
		...opts,
	}
	try {
		const res = await handler(...nOpts.handlerArgs)
		spinner.succeed(nOpts.successText)
		return res
	} catch (err) {
		spinner.fail(nOpts.failText)
		throw new Error(`Failed spin ${handler}, the error is ${err}`)
	}
}