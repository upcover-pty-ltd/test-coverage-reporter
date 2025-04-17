"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasePath = getBasePath;
const path_1 = __importDefault(require("path"));
function getBasePath({ coverageBasePath, parsedBasePath }) {
    if (parsedBasePath.startsWith(coverageBasePath)) {
        return parsedBasePath;
    }
    return path_1.default.relative('', `${coverageBasePath}/${parsedBasePath}`);
}
