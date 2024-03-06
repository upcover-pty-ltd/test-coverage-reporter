"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUncoveredLines = exports.processRow = exports.getMarkdownReportFromTextReport = exports.getMarkdownReport = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const getReportParts_1 = require("./utils/getReportParts");
const status_1 = require("./utils/status");
const getBasePath_1 = require("./utils/getBasePath");
async function getMarkdownReport({ pathToTextReport, fileNames, fullCoverage, ...restOptions }) {
    const textReport = await promises_1.default.readFile(pathToTextReport, { encoding: 'utf8' });
    return getMarkdownReportFromTextReport({
        textReport,
        fileNames,
        fullCoverage,
        ...restOptions
    });
}
exports.getMarkdownReport = getMarkdownReport;
function getMarkdownReportFromTextReport({ textReport, fileNames, fullCoverage, srcBasePath }) {
    const { coverageInfoHeader, coverageInfoRows } = (0, getReportParts_1.getReportParts)(textReport);
    const normalizedBasePath = path_1.default.relative('', srcBasePath);
    let currentBasePath = normalizedBasePath;
    const fileNamesSet = new Set(fileNames);
    const modifiedInfoRows = coverageInfoRows
        .map(row => {
        const { updatedRow, basePath } = processRow(row, currentBasePath);
        currentBasePath = (0, getBasePath_1.getBasePath)({
            coverageBasePath: normalizedBasePath,
            parsedBasePath: basePath
        });
        return fullCoverage || fileNamesSet.has(basePath) ? updatedRow : '';
    })
        .filter(row => row !== '');
    const modifiedInfoHeader = addStatusColumn(coverageInfoHeader);
    return [modifiedInfoHeader.join('\n'), modifiedInfoRows.join('\n')].join('\n');
}
exports.getMarkdownReportFromTextReport = getMarkdownReportFromTextReport;
function processRow(row, basePath) {
    // 0: name | 1: statements | 2: branches | 3: functions | 4: lines | 5: uncovered lines
    const columns = row.split('|');
    const parsedNameColumn = columns[0].match(/^( *)(\S+)/);
    if (parsedNameColumn) {
        const [, leadingSpaces, fileName] = parsedNameColumn;
        const mdLeadingSpaces = leadingSpaces.replaceAll(' ', '');
        basePath = fileName;
        columns[0] = mdLeadingSpaces + fileName;
    }
    const updatedRow = (0, status_1.getStatus)(parseFloat(columns[1])) + columns.join('|');
    return {
        basePath,
        updatedRow
    };
}
exports.processRow = processRow;
function formatUncoveredLines(rawUncoveredLines, filePath) {
    const uncoveredLines = rawUncoveredLines.trim();
    if (uncoveredLines === '') {
        return '';
    }
    return uncoveredLines
        .split(',')
        .map(group => group.trim())
        .map(group => `[${group}](${filePath}#${group.replaceAll(/\d+/g, 'L$&')})`)
        .join(',');
}
exports.formatUncoveredLines = formatUncoveredLines;
function addStatusColumn(headerRows) {
    const [header, divider, ...commonRows] = headerRows;
    const headerWithStatus = status_1.statusHeader + header;
    const dividerWithStatus = `--|${divider}`;
    const commonRowsWithStatus = commonRows.map(row => {
        // 0: name | 1: statements | 2: branches | 3: functions | 4: lines | 5: uncovered lines
        const [, statements] = row.split('|');
        return (0, status_1.getStatus)(parseFloat(statements)) + row;
    });
    return [headerWithStatus, dividerWithStatus, ...commonRowsWithStatus];
}
