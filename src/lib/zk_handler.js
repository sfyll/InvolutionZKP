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
exports.checkProof = exports.calculateProof = void 0;
const snarkjs_1 = require("snarkjs");
const utils_1 = require("./utils");
const calculateProof = function (imageData, directory_extension = "build/src/public/") {
    return __awaiter(this, void 0, void 0, function* () {
        const directory = (0, utils_1.getRootProjectDirectory)() + directory_extension;
        const matrixInputs = imageData.convertToProofTest();
        const witness = {
            rows: imageData.rows,
            columns: imageData.pixelsPerRow,
            image: matrixInputs
        };
        const { proof, publicSignals } = yield snarkjs_1.groth16.fullProve(witness, directory + "involution.wasm", directory + "involution_final.zkey");
        const res = yield (0, exports.checkProof)(proof, publicSignals);
        return {
            proof: proof,
            publicSignals: publicSignals,
            verification: res
        };
    });
};
exports.calculateProof = calculateProof;
const checkProof = function (proof, publicSignals) {
    return __awaiter(this, void 0, void 0, function* () {
        const vKey = yield (0, utils_1.getVerificationKey)();
        const res = yield snarkjs_1.groth16.verify(vKey, publicSignals, proof);
        return res;
    });
};
exports.checkProof = checkProof;
