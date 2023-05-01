import { dirname } from 'path';
import { readFileSync } from 'fs';

const { groth16 } = require("snarkjs")

import { PngHandler, prettyPrintArray } from "../../src/png_handling/png_handler"

function saveJSON(filename: string, jsonContent: object) {
    const blob = new Blob([JSON.stringify(jsonContent)], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function main() {
        const currentPath = dirname(__filename);
        const parentPath = dirname(currentPath);
        const baseDirectory = dirname(parentPath);
        const originalMetadata = JSON.parse(readFileSync(parentPath + "/50_50_image_metadata.json", { encoding: 'utf8' }));

        const imageData = new PngHandler(
            originalMetadata["rows"],
            originalMetadata["columns"],
            originalMetadata["pixels"]
        );

        
        const matrixFormat: string[][] =  imageData.convertToProofTest(5, 50);
        console.log(matrixFormat)
        const rows: number = matrixFormat.length;
        const columns: number = matrixFormat[0].length;

        const matrixInputs: string[] = matrixFormat.flat();
        
        console.log(matrixInputs);
        console.log(imageData.rows, rows);
        console.log(imageData.columns, columns);
        // console.log(prettyPrintArray(matrixFormat));

        const witness = {   rows: rows,
                            columns: columns,
                            image: matrixInputs }

        console.log("HERE");

        try {
            const { proof, publicSignals } = await groth16.fullProve(
                witness,
                baseDirectory + "/circuits/build/involution_js/involution.wasm",
                baseDirectory + "/circuits/zkFiles/involution_final.zkey"
            );
            const columns_output = publicSignals[-1];
            const rows_output = publicSignals[-2];
            const matrix_output = publicSignals.slice(0, publicSignals.length - 2);
            console.log(imageData.verifyProotTestOutput(matrixInputs, matrix_output));
            return;
        } catch (error) {
            console.error('Error during proof generation:', error);
        }
}

main();
