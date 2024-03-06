"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusHeader = exports.getStatus = void 0;
const RED_STATUS = '🔴|';
const YELLOW_STATUS = '🟡|';
const GREEN_STATUS = '🟢|';
function getStatus(statementsCovered) {
    if (statementsCovered < 50) {
        return RED_STATUS;
    }
    else if (statementsCovered > 80) {
        return GREEN_STATUS;
    }
    else {
        return YELLOW_STATUS;
    }
}
exports.getStatus = getStatus;
exports.statusHeader = 'St|';
