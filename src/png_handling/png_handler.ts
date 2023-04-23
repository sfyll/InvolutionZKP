import { readFileSync } from 'fs';
import { dirname } from 'path';
import ndarray from 'ndarray';

type Pixel = [number, number, number, number];

class PngHandler {
    rows: number;
    columns: number;
    pixels: Pixel[][];

    constructor(rows: number, columns: number, pixels: Pixel[][]) {
        this.rows = rows;
        this.columns = columns;
        this.pixels = pixels;
    }

    getMatrix() {
        return ndarray(this.pixels.flat().flat(), [this.rows, this.columns, 4]);
    }

    reverseMatrix() {
        const imageData = this.getMatrix();
        return imageData.step(-1, 1, 1);
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

    const loopReversed = imageData.reverseMatrix();

    console.log(loopReversed);
}

main();
