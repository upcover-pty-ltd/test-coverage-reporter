# Upcover test coverage reporter

This action uses a text coverage report from Istanbul/Jest and generates a Markdown report based on it in the format shown below.
The table shows the status of each file.

| St  | File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| --- | ------------------- | ------- | -------- | ------- | ------- | ----------------- |
| 🟡  | All files           | 70.58   | 72.22    | 83.33   | 71.42   |
| 🟡  | src                 | 63.23   | 64.28    | 80      | 64.17   |
| 🔴  | main.ts             | 0       | 0        | 0       | 0       | 1-37              |
| 🟢  | report.ts           | 95.55   | 100      | 88.88   | 95.55   | 14-15             |
| 🟢  | src/utils           | 100     | 100      | 100     | 100     |
| 🟢  | getReportParts.ts   | 100     | 100      | 100     | 100     |
| 🟢  | status.ts/status.ts | 100     | 100      | 100     | 100     |

## Usage

The action get the coverage file path and then add the comment with coverage report on the PR.

```yaml
steps:
  - name: Prepare markdown and add comment on PR
    uses: upcover-pty-ltd/test-coverage-reporter@v1.2
    with:
      textReportPath: './coverage/coverage.txt'
      githubToken: ${{ github.token}}
```

### Extended usage

```yaml
steps:
  - name: Get changed files
    id: changed-files
    uses: tj-actions/changed-files@v42
    with:
    files_yaml: |
      src:
        - src/**
  - name: Prepare markdown and add comment on PR
    uses: upcover-pty-ltd/test-coverage-reporter@v1.2
    with:
      textReportPath: './coverage/text-report.txt'
      githubToken: ${{ github.token}}
      srcBasePath: './src'
      fileNames: ${{ steps.changed-files.outputs.src_all_changed_files }}
      fullCoverage: 'false'
```

## API

### Inputs

| Name             | Type       | Default Value               | Description                                                                          |
| ---------------- | ---------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `textReportPath` | `string`   | `'./coverage/coverage.txt'` | Path to the coverage report in the [Istanbul](https://istanbul.js.org/) text format. |
| `githubToken`    | `string`   | `''`                        | Gihub access token.                                                                  |
| `srcBasePath`    | `string`   | `'./src'`                   | Base path for the source folder.                                                     |
| `fileNames`      | `string[]` | `[]`                        | Names of file changed in the current PR.                                             |
| `fullCoverage`   | `string`   | `'true'`                    | Generate full source coverage or the files changed.                                  |

## How to get a text coverage report

### Jest

- Using a CLI:

```shell
npx jest --coverage --coverageReporters="text" > coverage.txt
```

- Using a Configuration file:

```js
module.exports = {
  // ... other settings
  coverageReporters: [['text', {file: 'coverage.txt', path: './'}]]
}
```

### nyc (Istanbul)

- Using a CLI:

```shell
npx nyc report --reporter=text > ./coverage/coverage.txt
```

- Using a Configuration file:

```js
module.exports = {
  // ... other settings
  reporter: ['text'],
  'report-dir': './coverage' // will generate a file ./coverage/text.txt
}
```

### Karma

```js
module.exports = function (config) {
  config.set({
    // ... other settings
    reporters: ['coverage'],
    coverageReporter: {
      type: 'text',
      dir: './coverage',
      file: 'coverage.txt'
    }
  })
}
```
