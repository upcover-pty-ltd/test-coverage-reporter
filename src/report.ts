import fs from 'fs/promises'
import path from 'path'

import {getReportParts} from './utils/getReportParts'
import {getStatus, statusHeader} from './utils/status'
import {getBasePath} from './utils/getBasePath'

export async function getMarkdownReport({
  pathToTextReport,
  fileNames,
  fullCoverage,
  ...restOptions
}: {
  pathToTextReport: string
  fileNames: string[]
  fullCoverage: boolean
  srcBasePath: string
}): Promise<string> {
  const textReport = await fs.readFile(pathToTextReport, {encoding: 'utf8'})
  return getMarkdownReportFromTextReport({
    textReport,
    fileNames,
    fullCoverage,
    ...restOptions
  })
}

export function getMarkdownReportFromTextReport({
  textReport,
  fileNames,
  fullCoverage,
  srcBasePath
}: {
  textReport: string
  fileNames: string[]
  fullCoverage: boolean
  srcBasePath: string
}): string {
  const {coverageInfoHeader, coverageInfoRows} = getReportParts(textReport)
  const normalizedBasePath = path.relative('', srcBasePath)
  let currentBasePath = normalizedBasePath

  const fileNamesSet = new Set(fileNames)

  const modifiedInfoRows = coverageInfoRows
    .map(row => {
      const {updatedRow, basePath} = processRow(row, currentBasePath)
      currentBasePath = getBasePath({
        coverageBasePath: normalizedBasePath,
        parsedBasePath: basePath
      })

      return fullCoverage || fileNamesSet.has(basePath) ? updatedRow : ''
    })
    .filter(row => row !== '')

  const modifiedInfoHeader = addStatusColumn(coverageInfoHeader)
  return [modifiedInfoHeader.join('\n'), modifiedInfoRows.join('\n')].join('\n')
}

export function processRow(
  row: string,
  basePath: string
): {basePath: string; updatedRow: string} {
  // 0: name | 1: statements | 2: branches | 3: functions | 4: lines | 5: uncovered lines
  const columns = row.split('|')
  const parsedNameColumn = columns[0].match(/^( *)(\S+)/)
  if (parsedNameColumn) {
    const [, leadingSpaces, fileName] = parsedNameColumn
    const mdLeadingSpaces = leadingSpaces.replaceAll(' ', '')

    basePath = fileName
    columns[0] = mdLeadingSpaces + fileName
  }
  const updatedRow = getStatus(parseFloat(columns[1])) + columns.join('|')
  return {
    basePath,
    updatedRow
  }
}

export function formatUncoveredLines(
  rawUncoveredLines: string,
  filePath: string
): string {
  const uncoveredLines = rawUncoveredLines.trim()

  if (uncoveredLines === '') {
    return ''
  }

  return uncoveredLines
    .split(',')
    .map(group => group.trim())
    .map(group => `[${group}](${filePath}#${group.replaceAll(/\d+/g, 'L$&')})`)
    .join(',')
}

function addStatusColumn(headerRows: string[]): string[] {
  const [header, divider, ...commonRows] = headerRows

  const headerWithStatus = statusHeader + header
  const dividerWithStatus = `--|${divider}`
  const commonRowsWithStatus = commonRows.map(row => {
    // 0: name | 1: statements | 2: branches | 3: functions | 4: lines | 5: uncovered lines
    const [, statements] = row.split('|')
    return getStatus(parseFloat(statements)) + row
  })

  return [headerWithStatus, dividerWithStatus, ...commonRowsWithStatus]
}

