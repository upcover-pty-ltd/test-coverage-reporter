import {describe, it, expect} from '@jest/globals'
import {
  formatUncoveredLines,
  getMarkdownReportFromTextReport,
  processRow
} from '../src/report'
import {
  smallTextReportMock,
  smallTextReportNoBaseMock,
  smallTextReportSrcBaseMock
} from './mocks'

describe('Test `formatUncoveredLines` function', () => {
  it('empty string', () => {
    expect(formatUncoveredLines('', 'https://base.url/sha/')).toEqual('')
  })
  it('one line', () => {
    expect(formatUncoveredLines('9', 'https://base.url/sha/')).toEqual(
      '[9](https://base.url/sha/#L9)'
    )
  })
  it('one line block', () => {
    expect(formatUncoveredLines('9-12', 'https://base.url/sha/')).toEqual(
      '[9-12](https://base.url/sha/#L9-L12)'
    )
  })
  it('mixed content', () => {
    expect(formatUncoveredLines('9,14-16', 'https://base.url/sha/')).toEqual(
      '[9](https://base.url/sha/#L9),[14-16](https://base.url/sha/#L14-L16)'
    )
  })
  it('mixed content with spaces', () => {
    expect(
      formatUncoveredLines(' 9 , 14-16 ', 'https://base.url/sha/')
    ).toEqual(
      '[9](https://base.url/sha/#L9),[14-16](https://base.url/sha/#L14-L16)'
    )
  })
})

describe('Test `processRow` function', () => {
  it('row with folder', () => {
    const {basePath, updatedRow} = processRow(
      ' src/components        |   90.54 |       75 |   86.66 |   92.64 |',
      ''
    )
    expect(basePath).toEqual('src/components')
    expect(updatedRow).toEqual(
      '🟢|src/components|   90.54 |       75 |   86.66 |   92.64 |'
    )
  })
  it('row with file, empty basePath, 100% coverage', () => {
    const {basePath, updatedRow} = processRow(
      '  env.ts               |     100 |      100 |     100 |     100 |',
      ''
    )
    expect(basePath).toEqual('env.ts')
    expect(updatedRow).toEqual(
      '🟢|env.ts|     100 |      100 |     100 |     100 |'
    )
  })

  it('row with file, has basePath, 100% coverage', () => {
    const {basePath, updatedRow} = processRow(
      '  use-previous.ts      |     100 |      100 |     100 |     100 | ',
      'src/utils'
    )
    expect(basePath).toEqual('use-previous.ts')
    expect(updatedRow).toEqual(
      '🟢|use-previous.ts|     100 |      100 |     100 |     100 | '
    )
  })

  it('row with uncovered lines', () => {
    const {basePath, updatedRow} = processRow(
      ' report.ts |    77.5 |      100 |   71.42 |    77.5 | 8-24     ',
      'src/utils'
    )
    expect(basePath).toEqual('report.ts')
    expect(updatedRow).toEqual(
      '🟡|report.ts|    77.5 |      100 |   71.42 |    77.5 | 8-24     '
    )
  })

  it('row with uncovered file', () => {
    const {basePath, updatedRow} = processRow(
      ' report.ts |    0 |      0 |   0 |    0 | 1-24     ',
      'src/utils'
    )
    expect(basePath).toEqual('report.ts')
    expect(updatedRow).toEqual(
      '🔴|report.ts|    0 |      0 |   0 |    0 | 1-24     '
    )
  })
})

describe('Test `getMarkdownReportFromTextReport` function', () => {
  it('small report without base', () => {
    expect(
      getMarkdownReportFromTextReport({
        textReport: smallTextReportMock,
        srcBasePath: '',
        fileNames: [],
        fullCoverage: true
      })
    ).toEqual(smallTextReportNoBaseMock)
  })

  it('small report with `./src` base', () => {
    expect(
      getMarkdownReportFromTextReport({
        textReport: smallTextReportMock,
        srcBasePath: './src',
        fileNames: [],
        fullCoverage: true
      })
    ).toEqual(smallTextReportSrcBaseMock)
  })
})
