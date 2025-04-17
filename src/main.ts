import * as github from '@actions/github'
import * as core from '@actions/core'
import {getCovageStats, getMarkdownReport} from './report'

async function run(): Promise<void> {
  try {
    const textCoverageReportPath: string =
      core.getInput('textReportPath') || './coverage/coverage.txt'
    const srcBasePath: string = core.getInput('srcBasePath') || './src'
    const fileNames: string[] =
      core
        .getInput('fileNames')
        .split(' ')
        .map((filename: string) => filename.trim().replace('functions/', '')) ||
      []
    const fullCoverage: boolean =
      core.getInput('fullCoverage') === 'false' ? false : true
    const githubToken: string = core.getInput('githubToken') || ''
    const checkCoverage: boolean =
      core.getInput('checkCoverage') === 'false' ? false : true

    const {repo: repository, owner} = github.context.repo
    if (!repository) {
      core.error('Can`t detect repo url')
    }
    if (!owner) {
      core.error('Can`t detect owner url')
    }
    if (githubToken === '') {
      core.error('Can`t detect github token')
    }

    const mdReport = await getMarkdownReport({
      pathToTextReport: textCoverageReportPath,
      srcBasePath,
      fileNames,
      fullCoverage
    })

    const coverageStats = await getCovageStats({
      pathToTextReport: textCoverageReportPath
    })
    let bodyComment = fullCoverage
      ? `## 🚀 Full code coverage\n${mdReport}\n`
      : `## 🚀 Current changes code coverage\n${mdReport}`

    if (coverageStats.lines < 35) {
      bodyComment += `\n## 🚨🚨 Coverage does not meet the global threshold of 35%\nAdd missing lines coverage to fix this. Current is ${coverageStats.lines}%`
    }

    const octokit = github.getOctokit(githubToken)
    await octokit.rest.issues.createComment({
      owner,
      repo: repository,
      issue_number: github.context.issue.number,
      body: bodyComment
    })

    if (checkCoverage && coverageStats.lines < 35) {
      core.setFailed(
        `Coverage does not meet the global threshold of 35%. Add missing lines coverage to fix this. Current is ${coverageStats.lines}%`
      )
    }
    // core.setOutput('markdownReport', mdReport)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}

run()
