"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const report_1 = require("./report");
async function run() {
    try {
        const textCoverageReportPath = core.getInput('textReportPath') || './coverage/coverage.txt';
        const srcBasePath = core.getInput('srcBasePath') || './src';
        const fileNames = core
            .getInput('fileNames')
            .split(' ')
            .map((filename) => filename.trim()) || [];
        const fullCoverage = core.getInput('fullCoverage') === 'false' ? false : true;
        const githubToken = core.getInput('githubToken') || '';
        const { repo: repository, owner } = github.context.repo;
        if (!repository) {
            core.error('Can`t detect repo url');
        }
        if (!owner) {
            core.error('Can`t detect owner url');
        }
        if (githubToken === '') {
            core.error('Can`t detect github token');
        }
        const mdReport = await (0, report_1.getMarkdownReport)({
            pathToTextReport: textCoverageReportPath,
            srcBasePath,
            fileNames,
            fullCoverage
        });
        const octokit = github.getOctokit(githubToken);
        await octokit.rest.issues.createComment({
            owner,
            repo: repository,
            issue_number: github.context.issue.number,
            body: fullCoverage
                ? `## 🚀 Full code coverage\n${mdReport}`
                : `## 🚀 Current changes code coverage\n${mdReport}`
        });
        // core.setOutput('markdownReport', mdReport)
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(String(error));
        }
    }
}
run();
