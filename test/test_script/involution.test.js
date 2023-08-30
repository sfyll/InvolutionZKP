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
const test_utils_1 = require("./test_utils");
const utils_1 = require("../../src/lib/utils");
const snarkjs_1 = require("snarkjs");
const fs_1 = require("fs");
function testSetup(fileExtension, desiredRowsLength, desiredColumnsLength) {
    const baseDirectory = (0, utils_1.getRootProjectDirectory)();
    const imageData = (0, test_utils_1.generateImageData)(fileExtension, desiredRowsLength, desiredColumnsLength);
    const matrixInputs = imageData.convertToProofTest();
    const witness = {
        rows: imageData.rows,
        columns: imageData.pixelsPerRow,
        image: matrixInputs
    };
    return { witness, baseDirectory, imageData };
}
describe("Involution Circuit Tests", () => {
    function runTest(fileExtension, desiredRowsLength = 200, desiredColumnsLength = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            const { witness, baseDirectory, imageData } = testSetup(fileExtension, desiredRowsLength, desiredColumnsLength);
            try {
                const { proof, publicSignals } = yield snarkjs_1.groth16.fullProve(witness, baseDirectory + "/circuits/build/involution_js/involution.wasm", baseDirectory + "/circuits/zkFiles/involution_final.zkey");
                const result = (0, test_utils_1.validateCircomOutput)(imageData, publicSignals);
                (0, test_utils_1.generateAndSavePictures)(result, imageData);
                const vkey = JSON.parse((0, fs_1.readFileSync)(baseDirectory + "/circuits/zkFiles/verification_key.json", {
                    encoding: "utf8"
                }));
                const res = yield snarkjs_1.groth16.verify(vkey, publicSignals, proof);
                return { error: null, result: res };
            }
            catch (error) {
                return { error: error.message, result: false };
            }
        });
    }
    test("Failure due to wrong inputs (rows > desiredRowsLength)", () => __awaiter(void 0, void 0, void 0, function* () {
        const fileExtension = "/50_50_image_base_test.json";
        const desiredRowsLength = 51;
        //remove consol error as they are expected
        const originalConsolError = (0, utils_1.consoleErrorDisable)();
        const { error, result } = yield runTest(fileExtension, desiredRowsLength);
        (0, utils_1.consoleErrorEnable)(originalConsolError);
        expect(result).toBe(false);
        expect(error).toBe("Error: Too many signals set. ");
    }));
    test("Failure due to wrong inputs (columns > desiredColumnsLength)", () => __awaiter(void 0, void 0, void 0, function* () {
        const fileExtension = "/50_50_image_base_test.json";
        const desiredRowsLength = 50;
        const desiredColumnsLength = 201;
        //remove consol error as they are expected
        const originalConsolError = (0, utils_1.consoleErrorDisable)();
        const { error, result } = yield runTest(fileExtension, desiredRowsLength, desiredColumnsLength);
        (0, utils_1.consoleErrorEnable)(originalConsolError);
        expect(result).toBe(false);
        expect(error).toBe("Error: Too many signals set. ");
    }));
    test("Failure when an element is not 0 in the right-padded part of the matrix, as it is a violation of the given dimensions", () => __awaiter(void 0, void 0, void 0, function* () {
        const fileExtension = "/small_image_metadata.json";
        const { witness, baseDirectory, imageData } = yield testSetup(fileExtension, 50, 200);
        witness.image[imageData.desiredRowsLength * imageData.desiredColumnsLength - 1] = "157";
        //remove consol error as they are expected
        const originalConsolError = (0, utils_1.consoleErrorDisable)();
        try {
            yield snarkjs_1.groth16.fullProve(witness, baseDirectory + "/circuits/build/involution_js/involution.wasm", baseDirectory + "/circuits/zkFiles/involution_final.zkey");
        }
        catch (error) {
            (0, utils_1.consoleErrorEnable)(originalConsolError);
            expect(error.message).toContain("Error in template VerifyImageBounds_5 line: 54");
        }
    }));
    test("Proof success when fetching another JSON", () => __awaiter(void 0, void 0, void 0, function* () {
        const fileExtension = "/50_50_image_base_test.json";
        const desiredRowsLength = 50;
        const desiredColumnsLength = 200;
        const res = yield runTest(fileExtension, desiredRowsLength, desiredColumnsLength);
        expect(res.error).toBe(null);
        expect(res.result).toBe(true);
    }));
});
