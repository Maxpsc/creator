import path from 'path'
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs-extra'
import { compile } from 'handlebars'

/**
 * 拷贝目录并替换模板变量
 * @param dir 源模板目录
 * @param targetDir 目标目录
 * @param fields 变量集合
 */
export async function copyFileWithVars(
  dir: string,
  targetDir: string,
  fields?: Record<string, string>
) {
  const files = readdirSync(dir, { withFileTypes: true })

  files.forEach((obj) => {
    const filePath = path.resolve(dir, obj.name)
    const state = statSync(filePath)

    if (state.isFile()) {
      try {
        let file = readFileSync(filePath, 'utf-8')
        // 变量替换
        if (fields && Object.keys(fields).length) {
          const template = compile(file)
          file = template(fields)
        }

        writeFileSync(path.resolve(targetDir, obj.name), file)
      } catch (error) {
        throw new Error('copy error', error as any)
      }
    } else {
      const nextTargetPath = path.resolve(targetDir, obj.name)
      if (!existsSync(nextTargetPath)) {
        mkdirSync(nextTargetPath)
      }
      copyFileWithVars(path.join(dir, obj.name), nextTargetPath, fields)
    }
  })
}

/**
 * 批量检查文件是否存在，返回存在的文件数组
 * @param {*} files 待检查的文件数组
 * @param {*} transformPath 路径转换方法
 */
// function batchExistFiles(files, transformPath) {
//   const existFiles = []
//   for (let i = 0; i < files.length; i++) {
//     const absolutePath = transformPath(files[i])
//     if (fs.existsSync(absolutePath)) {
//       existFiles.push(files[i])
//     }
//   }
//   return existFiles
// }

// /**
//  * 批量删除文件
//  * @param {*} files 待删除的文件数组
//  * @param {*} transformPath 路径转换方法
//  * @param {*} logger 日志
//  */
// function batchDeleteFiles(files, transformPath, logger) {
//   for (let i = 0; i < files.length; i++) {
//     const absolutePath = transformPath(files[i])
//     if (fs.existsSync(absolutePath)) {
//       fs.removeSync(files[i])
//       logger.text = `${files[i]}已删除`
//     }
//   }
// }

// /**
//  * 追加文本
//  * @param {*} filePath
//  * @param {*} content
//  */
// function appendContentToFile(filePath, content) {
//   let file = fs.readFileSync(filePath, 'utf-8')
//   file += content
//   fs.writeFileSync(filePath, file)
// }
