"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PngHandler = exports.createPngHandlerFromImageData = void 0;
const fs_1 = require("fs");
const pngjs_1 = require("pngjs");
const ndarray_1 = __importDefault(require("ndarray"));
const assert_1 = __importDefault(require("assert"));
function createPngHandlerFromImageData(imageData) {
    const rows = imageData.height;
    const columns = imageData.width;
    const pixels = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const index = (y * columns + x) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            const a = imageData.data[index + 3];
            pixels.push([r, g, b, a]);
        }
    }
    console.log("Created");
    return new PngHandler(rows, columns, pixels);
}
exports.createPngHandlerFromImageData = createPngHandlerFromImageData;
class PngHandler {
    //desired rows and columns length for padding given array length in circom must be known at compile time!
    constructor(rows, columns, pixels, desiredRowsLength = 50, desiredColumnsLength = 200) {
        this.rows = rows;
        //each column is comprised of four pixels !
        this.columns = columns;
        this.pixelsPerRow = this.columns * 4;
        this.pixels = pixels;
        this.desiredRowsLength = desiredRowsLength;
        this.desiredColumnsLength = desiredColumnsLength;
    }
    check_inputs(rows, columns, desiredRowsLength, desiredColumnsLength) {
        (0, assert_1.default)(rows <= desiredRowsLength);
        (0, assert_1.default)(columns <= desiredColumnsLength);
    }
    getMatrixOfPixelsFromNumberArray(matrix) {
        return (0, ndarray_1.default)(matrix, [this.rows, this.columns, 4]);
    }
    getMatrixOfPixelsFromNdArray(matrix) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reshapedMatrix = (0, ndarray_1.default)(new Int16Array(matrix), [
            this.rows,
            this.columns,
            4
        ]);
        return reshapedMatrix;
    }
    //Flatten your matrix beforehand!
    getMatrix(matrix) {
        return (0, ndarray_1.default)(matrix, [this.rows, this.columns]);
    }
    ndarrayToSimpleArray(inputArray) {
        const simpleArray = [];
        // Assuming a 2D ndarray
        for (let i = 0; i < inputArray.shape[0]; i++) {
            for (let j = 0; j < inputArray.shape[1]; j++) {
                const value = inputArray.get(i, j);
                simpleArray.push(value);
            }
        }
        return simpleArray;
    }
    convertToProofTest() {
        const array2D = [];
        const flattenedPixels = this.pixels.flat().flat();
        for (let y = 0; y < this.rows; y++) {
            const rowArray = [];
            for (let x = 0; x < this.pixelsPerRow; x++) {
                const flatIndex = y * this.pixelsPerRow + x;
                rowArray.push(flattenedPixels[flatIndex].toString());
            }
            array2D.push(rowArray);
        }
        //Padding the matrix
        const columnPaddingLength = this.desiredColumnsLength - this.pixelsPerRow;
        const columnPadding = new Array(columnPaddingLength).fill("0");
        const emptyRowColumnsPadding = new Array(this.desiredColumnsLength).fill("0");
        for (let y = 0; y < this.desiredRowsLength; y++) {
            if (y < this.rows) {
                if (columnPadding.length > 0) {
                    array2D[y] = array2D[y].concat(columnPadding);
                }
            }
            else {
                if (emptyRowColumnsPadding.length > 0) {
                    array2D.push(emptyRowColumnsPadding);
                }
            }
        }
        return array2D.flat();
    }
    checkCircomOutput(matrixProofInput, matrixProofOutput, rows, columns) {
        (0, assert_1.default)(rows == this.rows);
        (0, assert_1.default)(columns == this.pixelsPerRow);
        const reversedViaTypeScriptTest = this.reverseRows(matrixProofInput);
        // Check if both matrices have the same dimensions
        if (reversedViaTypeScriptTest.length !== matrixProofOutput.length) {
            return {
                result: false,
                unpaddedProofOutput: [],
                reversedMatrixTest: (0, ndarray_1.default)([], [0, 0]),
                errorMsg: `Matrices have different dimensions: ${reversedViaTypeScriptTest.length} and ${matrixProofOutput.length}`
            };
        }
        // Check if the elements of both matrices are equal
        for (let i = 0; i < matrixProofOutput.length; i++) {
            if (matrixProofOutput[i] !== reversedViaTypeScriptTest[i]) {
                return {
                    result: false,
                    unpaddedProofOutput: [],
                    reversedMatrixTest: (0, ndarray_1.default)([], [0, 0]),
                    errorMsg: `Matrices have different elements at index ${i}: ${matrixProofOutput[i]} and ${reversedViaTypeScriptTest[i]}`
                };
            }
        }
        //now check the unpadded version
        const unpaddedProofOutput = this.unpadMatrix(matrixProofOutput).flat();
        const reversedMatrixTest = this.reverseMatrix(this.getMatrixOfPixelsFromNumberArray(this.pixels.flat().flat()));
        if (unpaddedProofOutput.length !==
            reversedMatrixTest.shape[0] *
                reversedMatrixTest.shape[1] *
                reversedMatrixTest.shape[2]) {
            return {
                result: false,
                unpaddedProofOutput: [],
                reversedMatrixTest: (0, ndarray_1.default)([], [0, 0]),
                errorMsg: `Matrices have different dimensions: ${unpaddedProofOutput.length} and ${reversedMatrixTest.shape[0] * reversedMatrixTest.shape[1]}`
            };
        }
        // Check if the elements of both matrices are equal
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                for (let pixel = 0; pixel < 4; pixel++) {
                    const flatIndex = (i * this.columns + j) * 4 + pixel;
                    if (unpaddedProofOutput[flatIndex] !==
                        reversedMatrixTest.get(i, j, pixel)) {
                        return {
                            result: false,
                            unpaddedProofOutput: [],
                            reversedMatrixTest: (0, ndarray_1.default)([], [0, 0]),
                            errorMsg: `Matrices have different elements at index ${i}: ${unpaddedProofOutput[i]} and ${reversedMatrixTest.get(i, j, pixel)}`
                        };
                    }
                }
            }
        }
        // If all elements are equal, return the object with the result and both matrices
        return {
            result: true,
            unpaddedProofOutput: unpaddedProofOutput,
            reversedMatrixTest: reversedMatrixTest,
            errorMsg: ""
        };
    }
    reverseMatrix(matrix) {
        return matrix.step(-1, 1, 1);
    }
    reverseRows(matrix) {
        const reversedMatrix = [];
        const matrixInput = (0, ndarray_1.default)(matrix, [
            this.desiredRowsLength,
            this.desiredColumnsLength
        ]);
        for (let i = 0; i < this.desiredRowsLength; i++) {
            const rowArray = [];
            for (let j = 0; j < this.desiredColumnsLength; j++) {
                rowArray.push(matrixInput.get(i, j));
            }
            reversedMatrix[this.desiredRowsLength - i - 1] = rowArray;
        }
        return reversedMatrix.flat();
    }
    unpadMatrix(reversedMatrix) {
        const unpaddedMatrix = [];
        const rowPadding = this.desiredRowsLength - this.rows;
        const colPadding = this.desiredColumnsLength - this.pixelsPerRow;
        for (let i = 0; i < this.desiredRowsLength; i++) {
            const row = [];
            for (let j = 0; j < this.desiredColumnsLength; j++) {
                if (i >= rowPadding && j >= colPadding) {
                    const toPush = reversedMatrix[i * this.desiredColumnsLength + j];
                    if (typeof toPush === "string") {
                        row.push(parseInt(toPush));
                    }
                    else if (typeof toPush === "number") {
                        row.push(toPush);
                    }
                }
            }
            if (row.length > 0) {
                unpaddedMatrix.push(row);
            }
        }
        return unpaddedMatrix;
    }
    convertToPng(imageData) {
        const png = new pngjs_1.PNG({
            width: this.rows,
            height: this.columns,
            inputColorType: 6
        });
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.pixelsPerRow; x++) {
                const idx = (png.width * y + x) << 2;
                png.data[idx] = imageData.get(y, x, 0);
                png.data[idx + 1] = imageData.get(y, x, 1);
                png.data[idx + 2] = imageData.get(y, x, 2);
                png.data[idx + 3] = imageData.get(y, x, 3);
            }
        }
        return png;
    }
    writePngToFile(png, outputPath) {
        return new Promise((resolve, reject) => {
            const stream = (0, fs_1.createWriteStream)(outputPath);
            png.pack().pipe(stream);
            stream.on("finish", resolve);
            stream.on("error", reject);
        });
    }
}
exports.PngHandler = PngHandler;
