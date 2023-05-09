import {
  generateImageData,
  validateCircomOutput,
  generateAndSavePictures
} from "./test_utils";
import {
  getRootProjectDirectory,
  consoleErrorDisable,
  consoleErrorEnable
} from "../../src/lib/utils";

import { groth16 } from "snarkjs";

import { readFileSync } from "fs";

function testSetup(
  fileExtension: string,
  desiredRowsLength: number,
  desiredColumnsLength: number
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
  return { witness, baseDirectory, imageData };
}

describe("Involution Circuit Tests", () => {
  async function runTest(
    fileExtension: string,
    desiredRowsLength = 200,
    desiredColumnsLength = 200
  ) {
    const { witness, baseDirectory, imageData } = testSetup(
      fileExtension,
      desiredRowsLength,
      desiredColumnsLength
    );

    try {
      const { proof, publicSignals } = await groth16.fullProve(
        witness,
        baseDirectory + "/circuits/build/involution_js/involution.wasm",
        baseDirectory + "/circuits/zkFiles/involution_final.zkey"
      );

      const result = validateCircomOutput(imageData, publicSignals);

      generateAndSavePictures(result, imageData);

      const vkey = JSON.parse(
        readFileSync(
          baseDirectory + "/circuits/zkFiles/verification_key.json",
          {
            encoding: "utf8"
          }
        )
      );

      const res = await groth16.verify(vkey, publicSignals, proof);

      return { error: null, result: res };
    } catch (error) {
      return { error: (error as Error).message, result: false };
    }
  }

  test("Failure due to wrong inputs (rows > desiredRowsLength)", async () => {
    const fileExtension = "/50_50_image_base_test.json";
    const desiredRowsLength = 51;
    //remove consol error as they are expected
    const originalConsolError = consoleErrorDisable();
    const { error, result } = await runTest(fileExtension, desiredRowsLength);
    consoleErrorEnable(originalConsolError);
    expect(result).toBe(false);
    expect(error).toBe("Error: Too many signals set. ");
  });

  test("Failure due to wrong inputs (columns > desiredColumnsLength)", async () => {
    const fileExtension = "/50_50_image_base_test.json";
    const desiredRowsLength = 50;
    const desiredColumnsLength = 201;
    //remove consol error as they are expected
    const originalConsolError = consoleErrorDisable();
    const { error, result } = await runTest(
      fileExtension,
      desiredRowsLength,
      desiredColumnsLength
    );
    consoleErrorEnable(originalConsolError);
    expect(result).toBe(false);
    expect(error).toBe("Error: Too many signals set. ");
  });

  test("Failure when an element is not 0 in the right-padded part of the matrix, as it is a violation of the given dimensions", async () => {
    const fileExtension = "/small_image_metadata.json";
    const { witness, baseDirectory, imageData } = await testSetup(
      fileExtension,
      50,
      200
    );

    witness.image[
      imageData.desiredRowsLength * imageData.desiredColumnsLength - 1
    ] = "157";

    //remove consol error as they are expected
    const originalConsolError = consoleErrorDisable();
    try {
      await groth16.fullProve(
        witness,
        baseDirectory + "/circuits/build/involution_js/involution.wasm",
        baseDirectory + "/circuits/zkFiles/involution_final.zkey"
      );
    } catch (error) {
      consoleErrorEnable(originalConsolError);
      expect((error as Error).message).toContain(
        "Error in template VerifyImageBounds_5 line: 54"
      );
    }
  });

  test("Proof success when fetching another JSON", async () => {
    const fileExtension = "/50_50_image_base_test.json";
    const desiredRowsLength = 50;
    const desiredColumnsLength = 200;
    const res = await runTest(
      fileExtension,
      desiredRowsLength,
      desiredColumnsLength
    );
    expect(res.error).toBe(null);
    expect(res.result).toBe(true);
  });
});
