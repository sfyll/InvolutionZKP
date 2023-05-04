// import {  createWriteStream } from 'fs';
import { PNG } from 'pngjs';
import ndarray, { NdArray } from 'ndarray';
import assert from 'assert';

export function createPngHandlerFromImageData(imageData: ImageData): PngHandler {
    const rows = imageData.height;
    const columns = imageData.width;
    const pixels: number[][] = [];
  
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
  
export class PngHandler {
    rows: number;
    columns: number;
    pixelsPerRow: number;
    pixels: number[][];
    desiredRowsLength: number;
    desiredColumnsLength: number;

    //desired rows and columns length for padding given array length in circom must be known at compile time!
    constructor(rows: number, columns: number, pixels: number[][], desiredRowsLength: number = 50, desiredColumnsLength: number = 200) {
        this.rows = rows;
        //each column is comprised of four pixels !
        this.columns = columns;
        this.pixelsPerRow = this.columns * 4;
        this.pixels = pixels;
        this.desiredRowsLength = desiredRowsLength;
        this.desiredColumnsLength = desiredColumnsLength;
    }

    check_inputs(rows: number, columns: number, desiredRowsLength: number, desiredColumnsLength: number) {
        assert(rows <= desiredRowsLength);
        assert(columns <= desiredColumnsLength);
    }

    getMatrixOfPixelsFromNumberArray(matrix: number[]) {
        return ndarray(matrix, [this.rows, this.columns, 4]);
    }
    
    getMatrixOfPixelsFromNdArray(matrix: NdArray) {
        const reshapedMatrix = ndarray(new Int16Array(matrix as any), [this.rows, this.columns, 4]);
        return reshapedMatrix;
    }
    

    //Flatten your matrix beforehand!
    getMatrix(matrix: number[]) {
        return ndarray(matrix, [this.rows, this.columns]);
    }

    ndarrayToSimpleArray(inputArray: NdArray): number[] {
        const simpleArray: number[] = [];

        // Assuming a 2D ndarray
        for (let i = 0; i < inputArray.shape[0]; i++) {
            for (let j = 0; j < inputArray.shape[1]; j++) {
            const value = inputArray.get(i, j);
            simpleArray.push(value);
            }
        }
        return simpleArray;
    }
    convertToProofTest(): string[] {
        let array2D: string[][] = [];

        const flattenedPixels = this.pixels.flat().flat();

        for (let y = 0; y < this.rows; y++) {
            var rowArray: string[] = [];
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

    checkCircomOutput(matrixProofInput: string[], matrixProofOutput: string[], rows: number, columns: number): 
    { result: boolean; unpaddedProofOutput: number[]; reversedMatrixTest: NdArray, errorMsg: string } {
        assert(rows == this.rows);
        assert(columns == this.pixelsPerRow);
    
        const reversedViaTypeScriptTest = this.reverseRows(matrixProofInput)
    
        // Check if both matrices have the same dimensions
        if (reversedViaTypeScriptTest.length !== matrixProofOutput.length) {
            return { result: false, 
                unpaddedProofOutput: [], 
                reversedMatrixTest: ndarray([], [0, 0]),
                errorMsg: `Matrices have different dimensions: ${reversedViaTypeScriptTest.length} and ${matrixProofOutput.length}` };
        }
    
        // Check if the elements of both matrices are equal
        for (let i = 0; i < matrixProofOutput.length; i++) {
            if (matrixProofOutput[i] !== reversedViaTypeScriptTest[i]) {
                return { result: false, 
                    unpaddedProofOutput: [], 
                    reversedMatrixTest: ndarray([], [0, 0]),
                    errorMsg: `Matrices have different elements at index ${i}: ${matrixProofOutput[i]} and ${reversedViaTypeScriptTest[i]}` };
            }
        }
    
        //now check the unpadded version
        const unpaddedProofOutput = this.unpadMatrix(matrixProofOutput).flat();
        const reversedMatrixTest = this.reverseMatrix(this.getMatrixOfPixelsFromNumberArray(this.pixels.flat().flat()));
    
        if (unpaddedProofOutput.length !== reversedMatrixTest.shape[0] * reversedMatrixTest.shape[1] * reversedMatrixTest.shape[2]) {
            return { result: false, 
                unpaddedProofOutput: [], 
                reversedMatrixTest: ndarray([], [0, 0]),
                errorMsg: `Matrices have different dimensions: ${unpaddedProofOutput.length} and ${reversedMatrixTest.shape[0] * reversedMatrixTest.shape[1]}` };
        }


        // Check if the elements of both matrices are equal
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                for (let pixel = 0; pixel < 4; pixel++) {
                    const flatIndex = (i * this.columns + j) * 4 + pixel;
                    if (unpaddedProofOutput[flatIndex] !== reversedMatrixTest.get(i, j, pixel)) {
                            return { result: false, 
                                unpaddedProofOutput: [], 
                                reversedMatrixTest: ndarray([], [0, 0]),
                                errorMsg: `Matrices have different elements at index ${i}: ${unpaddedProofOutput[i]} and ${reversedMatrixTest.get(i, j , pixel)}` };
                        }
                    }
                }
            }
    
        // If all elements are equal, return the object with the result and both matrices
        return { result: true, unpaddedProofOutput: unpaddedProofOutput, reversedMatrixTest: reversedMatrixTest, errorMsg: "" };
    }
    
    reverseMatrix(matrix: NdArray) {;
        return matrix.step(-1, 1, 1);
    }

    reverseRows(matrix: string[]): string[] {
        const reversedMatrix: string[][] = [];
        const matrixInput = ndarray(matrix, [this.desiredRowsLength, this.desiredColumnsLength]);
        
        for (let i = 0; i < this.desiredRowsLength; i++) {
            var rowArray: string[] = [];
            for (let j = 0; j < this.desiredColumnsLength; j++) {
                rowArray.push(matrixInput.get(i, j));
            }
            reversedMatrix[this.desiredRowsLength - i - 1] = rowArray;
        }
        
        return reversedMatrix.flat();
    }

    unpadMatrix(reversedMatrix: (string[] | number[])): number[][] {
        const unpaddedMatrix: number[][] = [];    
        const rowPadding = this.desiredRowsLength - this.rows;
        const colPadding = this.desiredColumnsLength - this.pixelsPerRow;
    
        for (let i = 0; i < this.desiredRowsLength; i++) {
            const row: number[] = [];
            for (let j = 0; j < this.desiredColumnsLength; j++) {
                if (i >= rowPadding && j >= colPadding) {
                    const toPush = reversedMatrix[i * this.desiredColumnsLength + j];
                    if (typeof(toPush) === "string"){
                        row.push(parseInt(toPush));
                    }
                    else if (typeof(toPush) === "number"){
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
    

    convertToPng(imageData: ndarray.NdArray): PNG {
        const png = new PNG({ width: this.rows, height: this.columns, inputColorType: 6});
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

    // writePngToFile(png: PNG, outputPath: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const stream = createWriteStream(outputPath);
    //         png.pack().pipe(stream);
    //         stream.on('finish', resolve);
    //         stream.on('error', reject);
    //     });
    // }
}