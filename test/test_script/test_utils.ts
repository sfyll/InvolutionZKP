import { readFileSync } from "fs";

import { groth16 } from "snarkjs";

import { PngHandler } from "../../src/lib/png_handler";
import { getRootProjectDirectory } from "../../src/lib/utils";
import { assert } from "console";
import { NdArray } from "ndarray";

export function generateImageData(
  fileExtension: string,
  desiredRowsLength: number,
  desiredColumnsLength = 200
): PngHandler {
  const baseDirectory = getRootProjectDirectory();
  const originalMetadata = JSON.parse(
    readFileSync(baseDirectory + "/test" + fileExtension, { encoding: "utf8" })
  );

  const imageData = new PngHandler(
    originalMetadata["rows"],
    originalMetadata["columns"],
    originalMetadata["pixels"],
    desiredRowsLength,
    desiredColumnsLength
  );

  return imageData;
}

export function validateCircomOutput(
  imageData: PngHandler,
  publicSignals: []
): {
  result: boolean;
  unpaddedProofOutput: number[];
  reversedMatrixTest: NdArray;
  errorMsg: string;
} {
  const columns_output: number = publicSignals[publicSignals.length - 1];
  const rows_output: number = publicSignals[publicSignals.length - 2];
  const matrix_output: string[] = publicSignals.slice(
    0,
    publicSignals.length - 2
  );

  const result = imageData.checkCircomOutput(
    imageData.convertToProofTest(),
    matrix_output,
    rows_output,
    columns_output
  );

  return result;
}

export function generateAndSavePictures(
  result: {
    result: boolean;
    unpaddedProofOutput: number[];
    reversedMatrixTest: NdArray;
    errorMsg: string;
  },
  imageData: PngHandler
) {
  const pixelisedProof = imageData.getMatrixOfPixelsFromNumberArray(
    result.unpaddedProofOutput
  );
  const png_test = imageData.convertToPng(pixelisedProof);

  const png = imageData.convertToPng(result.reversedMatrixTest);
  const baseDirectory = getRootProjectDirectory();

  const outputPath =
    baseDirectory + "/test/test_script/reversed_image_via_circom.png";
  const outputPathReal =
    baseDirectory + "/test/test_script/reversed_image_via_typescript.png";
  imageData.writePngToFile(png_test, outputPath);
  imageData.writePngToFile(png, outputPathReal);
}

export async function tester(
  fileExtension = "/50_50_image_base_test.json",
  desiredRowsLength = 50,
  desiredColumnsLength = 200
) {
  const baseDirectory = getRootProjectDirectory();

  const imageData = generateImageData(
    fileExtension,
    desiredRowsLength,
    desiredColumnsLength
  );

  const matrixInputs: string[] = imageData.convertToProofTest();

  const witness = {
    rows: imageData.rows,
    columns: imageData.pixelsPerRow,
    image: matrixInputs
  };

  try {
    const { proof, publicSignals } = await groth16.fullProve(
      witness,
      baseDirectory + "/circuits/build/involution_js/involution.wasm",
      baseDirectory + "/circuits/zkFiles/involution_final.zkey"
    );

    const result = validateCircomOutput(imageData, publicSignals);

    assert(result.result == true, result.errorMsg);

    generateAndSavePictures(result, imageData);

    const vkey = JSON.parse(
      readFileSync(baseDirectory + "/circuits/zkFiles/verification_key.json", {
        encoding: "utf8"
      })
    );

    const res = await groth16.verify(vkey, publicSignals, proof);

    assert(res === true, res);

    console.log("Verification status:", res);

    process.exit(0);
  } catch (error) {
    console.error("Error during proof generation:", error);
    process.exit(1);
  }
}
