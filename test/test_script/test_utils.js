"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tester = exports.generateAndSavePictures = exports.validateCircomOutput = exports.generateImageData = void 0;
const fs_1 = require("fs");
const snarkjs_1 = require("snarkjs");
const png_handler_1 = require("../../src/lib/png_handler");
const utils_1 = require("../../src/lib/utils");
const console_1 = require("console");
function generateImageData(fileExtension, desiredRowsLength, desiredColumnsLength = 200) {
    const baseDirectory = (0, utils_1.getRootProjectDirectory)();
    const originalMetadata = JSON.parse((0, fs_1.readFileSync)(baseDirectory + "/test" + fileExtension, { encoding: "utf8" }));
    const imageData = new png_handler_1.PngHandler(originalMetadata["rows"], originalMetadata["columns"], originalMetadata["pixels"], desiredRowsLength, desiredColumnsLength);
    return imageData;
}
exports.generateImageData = generateImageData;
function validateCircomOutput(imageData, publicSignals) {
    const columns_output = publicSignals[publicSignals.length - 1];
    const rows_output = publicSignals[publicSignals.length - 2];
    const matrix_output = publicSignals.slice(0, publicSignals.length - 2);
    const result = imageData.checkCircomOutput(imageData.convertToProofTest(), matrix_output, rows_output, columns_output);
    return result;
}
exports.validateCircomOutput = validateCircomOutput;
function generateAndSavePictures(result, imageData) {
    const pixelisedProof = imageData.getMatrixOfPixelsFromNumberArray(result.unpaddedProofOutput);
    const png_test = imageData.convertToPng(pixelisedProof);
    const png = imageData.convertToPng(result.reversedMatrixTest);
    const baseDirectory = (0, utils_1.getRootProjectDirectory)();
    const outputPath = baseDirectory + "/test/test_script/reversed_image_via_circom.png";
    const outputPathReal = baseDirectory + "/test/test_script/reversed_image_via_typescript.png";
    imageData.writePngToFile(png_test, outputPath);
    imageData.writePngToFile(png, outputPathReal);
}
exports.generateAndSavePictures = generateAndSavePictures;
function tester(fileExtension = "/50_50_image_base_test.json", desiredRowsLength = 50, desiredColumnsLength = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseDirectory = (0, utils_1.getRootProjectDirectory)();
        const imageData = generateImageData(fileExtension, desiredRowsLength, desiredColumnsLength);
        const matrixInputs = imageData.convertToProofTest();
        const witness = {
            rows: imageData.rows,
            columns: imageData.pixelsPerRow,
            image: matrixInputs
        };
        try {
            const { proof, publicSignals } = yield snarkjs_1.groth16.fullProve(witness, baseDirectory + "/circuits/build/involution_js/involution.wasm", baseDirectory + "/circuits/zkFiles/involution_final.zkey");
            const result = validateCircomOutput(imageData, publicSignals);
            (0, console_1.assert)(result.result == true, result.errorMsg);
            generateAndSavePictures(result, imageData);
            const vkey = JSON.parse((0, fs_1.readFileSync)(baseDirectory + "/circuits/zkFiles/verification_key.json", {
                encoding: "utf8"
            }));
            const res = yield snarkjs_1.groth16.verify(vkey, publicSignals, proof);
            (0, console_1.assert)(res === true, res);
            console.log("Verification status:", res);
            process.exit(0);
        }
        catch (error) {
            console.error("Error during proof generation:", error);
            process.exit(1);
        }
    });
}
exports.tester = tester;
