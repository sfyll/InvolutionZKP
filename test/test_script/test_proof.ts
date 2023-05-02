import { dirname } from 'path';
import { readFileSync } from 'fs';

const { groth16 } = require("snarkjs")

import { PngHandler } from "../../src/lib/png_handler"
import { assert } from 'console';

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
        const originalMetadata = JSON.parse(readFileSync(parentPath + "/50_50_image_data_real.json", { encoding: 'utf8' }));

        const imageData = new PngHandler(
            originalMetadata["rows"],
            originalMetadata["columns"],
            originalMetadata["pixels"],
            50,
            200
        );

        const matrixInputs: string[] =  imageData.convertToProofTest();
        const rows: number = imageData.rows;
        const columns: number = imageData.pixelsPerRow;
        
        console.log(matrixInputs);
        console.log(imageData.rows, rows);
        console.log(imageData.columns, columns);
        // console.log(prettyPrintArray(matrixFormat));

        const witness = {   rows: rows,
                            columns: columns,
                            image: matrixInputs }


        try {
            const { proof, publicSignals } = await groth16.fullProve(
                witness,
                baseDirectory + "/circuits/build/involution_js/involution.wasm",
                baseDirectory + "/circuits/zkFiles/involution_final.zkey"
            );
            const columns_output = publicSignals[publicSignals.length - 1];
            const rows_output = publicSignals[publicSignals.length - 2];
            const matrix_output = publicSignals.slice(0, publicSignals.length - 2);
            
            //test
            const result = imageData.checkCircomOutput(matrixInputs, matrix_output, rows_output, columns_output);

            assert(result.result == true, result.errorMsg);
            
            //get png for proof output
            const pixelisedProof = imageData.getMatrixOfPixelsFromNumberArray(result.unpaddedProofOutput);
            const png_test = imageData.convertToPng(pixelisedProof);
            
            const png = imageData.convertToPng(result.reversedMatrixTest);
            const currentPath = dirname(__filename);
            const parentPath = dirname(currentPath);
            const parentOfParentPath = dirname(parentPath);
    
            const outputPath = parentOfParentPath + "/test/test_script/reversed_image.png";
            const outputPathReal = parentOfParentPath + "/test/test_script/reversed_image_correct.png";
            imageData.writePngToFile(png_test, outputPath);
            imageData.writePngToFile(png, outputPathReal);


            //verification
            const vkey = JSON.parse(readFileSync(baseDirectory+"/circuits/zkFiles/verification_key.json", { encoding: 'utf8' }))
            console.log(vkey);
            const res = await groth16.verify(vkey, publicSignals, proof);

            console.log("Verification status:", res);
        } catch (error) {
            console.error('Error during proof generation:', error);
        }


    return;

}

main();
