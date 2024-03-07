import * as github from '@actions/github'
import * as core from '@actions/core'
import {getMarkdownReport} from './report'

async function run(): Promise<void> {
  try {
    const textCoverageReportPath: string =
      core.getInput('textReportPath') || './coverage/coverage.txt'
    const srcBasePath: string = core.getInput('srcBasePath') || './src'
    const fileNames: string[] =
      core
        .getInput('fileNames')
        .split(' ')
        .map((filename: string) => filename.trim()) || []
    const fullCoverage: boolean =
      core.getInput('fullCoverage') === 'false' ? false : true
    const githubToken: string = core.getInput('githubToken') || ''

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

    const octokit = github.getOctokit(githubToken)

    await octokit.rest.issues.createComment({
      owner,
      repo: repository,
      issue_number: github.context.issue.number,
      body: fullCoverage
        ? `## 🚀 Full code coverage\n${mdReport}`
        : `## 🚀 Current changes code coverage\n${mdReport}`
    })
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
