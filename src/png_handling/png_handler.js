"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const ndarray_1 = __importDefault(require("ndarray"));
class PngHandler {
    constructor(rows, columns, pixels) {
        this.rows = rows;
        this.columns = columns;
        this.pixels = pixels;
    }
    getMatrix() {
        return (0, ndarray_1.default)(this.pixels.flat().flat(), [this.rows, this.columns, 4]);
    }
    reverseMatrix() {
        const imageData = this.getMatrix();
        return imageData.step(-1, 1, 1);
    }
}
function main() {
    const currentPath = (0, path_1.dirname)(__filename);
    const parentPath = (0, path_1.dirname)(currentPath);
    const parentOfParentPath = (0, path_1.dirname)(parentPath);
    const originalMetadata = JSON.parse((0, fs_1.readFileSync)(parentOfParentPath + "/test/original_image_metadata.json", { encoding: 'utf8' }));
    const imageData = new PngHandler(originalMetadata["rows"], originalMetadata["columns"], originalMetadata["pixels"]);
    const loopReversed = imageData.reverseMatrix();
    console.log(loopReversed);
}
main();
