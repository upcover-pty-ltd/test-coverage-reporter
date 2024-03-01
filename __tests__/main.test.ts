import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test} from '@jest/globals'
import * as fs from 'fs/promises'
import {smallTextReportMock} from './mocks'

const coverageDir = './coverage'
const coverageMockPath = `${coverageDir}/coverage-mock.txt`
// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', async () => {
  process.env['INPUT_TEXTREPORTPATH'] = coverageMockPath
  process.env['GITHUB_SHA'] = 'b7f702e50c62e5291dfa74886525bfe4b5ee2c71'
  process.env['GITHUB_REF'] =
    'https://github.com/upcover-pty-ltd/test-coverage-reporter'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  try {
    await fs.readdir(coverageDir)
  } catch (e) {
    await fs.mkdir(coverageDir)
  }
  await fs.writeFile(coverageMockPath, smallTextReportMock)
})
