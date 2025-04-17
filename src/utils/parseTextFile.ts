import {promises as fs} from 'fs'

export async function modifyFileContent(filePath: string): Promise<void> {
  // Read the file content
  const data = await fs.readFile(filePath, 'utf8')

  const lines: string[] = data.split('\n')
  const modifiedLines: string[] = []
  let prefix = 'src'

  for (const line of lines) {
    if (
      !line.startsWith('src') &&
      !line.startsWith('---') &&
      line.split('|')[0].trim().endsWith('.ts')
    ) {
      const fileName: string = line.split('|')[0].trim()
      const modifiedLine = `${prefix}/${fileName}|${line.substring(
        line.indexOf('|') + 1
      )}`
      modifiedLines.push(modifiedLine)
    } else {
      prefix = line.split('|')[0].trim()
      modifiedLines.push(line)
    }
  }

  const modifiedContent: string = modifiedLines.join('\n')

  // Write the modified content back to the file
  await fs.writeFile(filePath, modifiedContent, 'utf8')
}
