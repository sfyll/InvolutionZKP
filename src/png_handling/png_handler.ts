import { readFileSync, createWriteStream } from 'fs';
import { dirname } from 'path';
import { PNG } from 'pngjs';
import ndarray from 'ndarray';

export const prettyPrintArray = function (json: string | number[][]) {
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }
    let output = JSON.stringify(json, function(k,v) {
      if(v instanceof Array)
        return JSON.stringify(v);
      return v;
    }, 2).replace(/\\/g, ' ')
          .replace(/\"\[/g, '[')
          .replace(/\]\"/g,']')
          .replace(/\"\{/g, '{')
          .replace(/\}\"/g,'}');
  
    return output;
  }

export class PngHandler {
    rows: number;
    columns: number;
    pixels: number[][];

    constructor(rows: number, columns: number, pixels: number[][]) {
        this.rows = rows;
        this.columns = columns;
        this.pixels = pixels;
    }

    getMatrix() {
        return ndarray(this.pixels.flat().flat(), [this.rows, this.columns, 4]);
    }

    convertToProofTest(desiredRowsLength: number = 500, desiredColumnsLength: number = 500): string[][] {
        const array2D: string[][] = [];

        //constructing original matrix
        for (let y = 0; y < this.rows; y++) {
            var rowArray: string[] = [];
            for (let x = 0; x < this.columns; x++) {
                rowArray.push(this.pixels[y][x].toString());
            }
            array2D.push(rowArray);
        }        

        //Padding the matrix
        const columnPaddingLength = desiredColumnsLength - this.columns;
        const columnPadding = new Array(columnPaddingLength).fill("0");
        const emptyRowColumnsPadding = new Array(desiredColumnsLength).fill("0");
        for (let y = 0; y < desiredRowsLength; y++) {
            if (y < this.rows) {
                array2D[y] = array2D[y].concat(columnPadding);
            }
            else {
            array2D.push(emptyRowColumnsPadding);
            }
        }
        return array2D;
    }

    verifyProotTestOutput(matrixInput: string[], matrixOutput: string[], desiredRowsLength: number = 5, desiredColumnsLength: number = 50): boolean {
        const reversedInput = this.reverseRows(matrixInput, desiredRowsLength, desiredColumnsLength)

        // Check if both matrices have the same dimensions
        if (reversedInput.length !== matrixOutput.length) {
            return false;
        }

        // Check if the elements of both matrices are equal
        for (let i = 0; i < matrixOutput.length; i++) {
            if (matrixOutput[i] !== reversedInput[i]) {
                return false;
            }
        }

        // If all elements are equal, return true
        return true;
    }

    reverseMatrix() {
        const imageData = this.getMatrix();
        return imageData.step(-1, 1, 1);
    }

    reverseRows(matrix: string[], rows: number, columns: number): string[] {
        const reversedMatrix: string[][] = [];
        const matrixInput = ndarray(matrix, [rows, columns]);
        
        for (let i = 0; i < rows; i++) {
            var rowArray: string[] = [];
            for (let j = 0; j < columns; j++) {
                rowArray.push(matrixInput.get(i, j));
            }
            reversedMatrix[rows - i - 1] = rowArray;
        }
        
        return reversedMatrix.flat();
    }

    convertToPng(imageData: ndarray.NdArray): PNG {
        const png = new PNG({ width: imageData.shape[1], height: imageData.shape[0] });
        for (let y = 0; y < imageData.shape[0]; y++) {
            for (let x = 0; x < imageData.shape[1]; x++) {
                const idx = (png.width * y + x) << 2;
                png.data[idx] = imageData.get(y, x, 0);
                png.data[idx + 1] = imageData.get(y, x, 1);
                png.data[idx + 2] = imageData.get(y, x, 2);
                png.data[idx + 3] = imageData.get(y, x, 3);
            }
        }
        return png;
    }

    writePngToFile(png: PNG, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const stream = createWriteStream(outputPath);
            png.pack().pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }
}

function main() {
    const currentPath = dirname(__filename);
    const parentPath = dirname(currentPath);
    const parentOfParentPath = dirname(parentPath);

    const originalMetadata = JSON.parse(readFileSync(parentOfParentPath + "/test/original_image_metadata.json", { encoding: 'utf8' }));

    const imageData = new PngHandler(
        originalMetadata["rows"],
        originalMetadata["columns"],
        originalMetadata["pixels"]
    );

    const reversedImage = imageData.reverseMatrix();

    const png = imageData.convertToPng(reversedImage);

    
    const outputPath = parentOfParentPath + "/test/test_script/reversed_image.png";
    imageData.writePngToFile(png, outputPath);
}

main();
