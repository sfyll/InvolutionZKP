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
const png_handler_1 = require("./lib/png_handler");
const zk_handler_1 = require("./lib/zk_handler");
const crypto_1 = require("crypto");
let proofHandler = {
    proof: null,
    publicSignals: {},
    verification: false,
    imageHash: ""
};
let png_handler;
let isFlipped = false;
document.addEventListener("DOMContentLoaded", () => {
    const warningModal = document.getElementById("warningModal");
    warningModal.style.display = "block";
    const inputImage = document.getElementById("inputImage");
    const closeModal = document.querySelector(".close");
    const okButton = document.getElementById("okButton");
    const openFilePicker = new Event("openFilePicker");
    const spinner = document.getElementById("spinner");
    const flipButtonHandler = document.getElementById("flipButton");
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d");
    const copyProofButton = document.getElementById("copyProof");
    const proofOutputElement = document.getElementById("proofOutput");
    const verifyProofButton = document.getElementById("verifyProof");
    const verificationResult = document.getElementById("verificationResult");
    let img;
    closeModal.addEventListener("click", () => {
        warningModal.style.display = "none";
    });
    window.addEventListener("click", event => {
        if (event.target === warningModal) {
            warningModal.style.display = "none";
        }
    });
    okButton.addEventListener("click", () => {
        warningModal.style.display = "none";
        inputImage.dispatchEvent(openFilePicker);
    });
    inputImage.addEventListener("change", (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        e.stopImmediatePropagation();
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file && file.type === "image/png") {
            img = yield loadImage(file);
            drawImage(img);
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                png_handler = (0, png_handler_1.createPngHandlerFromImageData)(imageData);
            }
            // Reset the transformation matrix for the new image
            if (isFlipped) {
                canvas.style.transform = "";
                isFlipped = false;
            }
        }
    }));
    flipButtonHandler.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.stopImmediatePropagation();
        if (img) {
            flipImage();
            showSpinner();
            yield populateProofHandler();
            hideSpinner();
        }
    }));
    copyProofButton.addEventListener("click", e => {
        e.stopImmediatePropagation();
        if (proofHandler.proof &&
            proofHandler.publicSignals &&
            proofHandler.verification) {
            proofOutputElement.value = getStringProofOutput();
            proofOutputElement.select();
            document.execCommand("copy");
        }
    });
    verifyProofButton.addEventListener("click", e => {
        e.stopImmediatePropagation();
        if (proofHandler.proof &&
            proofHandler.publicSignals &&
            proofHandler.verification) {
            if (proofOutputElement.value === "" ||
                proofOutputElement.value === getStringProofOutput()) {
                const currentImageHash = generateImageHash(ctx.getImageData(0, 0, img.width, img.height));
                if (currentImageHash === proofHandler.imageHash) {
                    verificationResult.value = `Proof validation result is: ${proofHandler.verification}`;
                }
            }
            else {
                verificationResult.value =
                    "Error: The image has been changed. Please regenerate the proof.";
            }
        }
        else {
            verificationResult.value = "Proof validation result is false";
        }
    });
    function loadImage(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = URL.createObjectURL(file);
            });
        });
    }
    function drawImage(img) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0);
    }
    function flipImage() {
        if (ctx) {
            canvas.style.transform = isFlipped ? "" : "rotate(180deg)";
            isFlipped = !isFlipped;
        }
    }
    function populateProofHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            if (png_handler) {
                const result = yield (0, zk_handler_1.calculateProof)(png_handler);
                proofHandler = {
                    proof: result.proof,
                    publicSignals: result.publicSignals,
                    verification: result.verification,
                    imageHash: generateImageHash(ctx.getImageData(0, 0, img.width, img.height))
                };
                displayProof();
            }
        });
    }
    function displayProof() {
        if (proofHandler.proof &&
            proofHandler.publicSignals &&
            proofHandler.verification) {
            proofOutputElement.value = getStringProofOutput();
        }
    }
    function hideProof() {
        if (proofHandler.proof &&
            proofHandler.publicSignals &&
            proofHandler.verification) {
            proofOutputElement.value = "";
        }
    }
    function generateImageHash(imageData) {
        const hash = (0, crypto_1.createHash)("sha256");
        hash.update(new Uint8Array(imageData.data.buffer));
        return hash.digest("hex");
    }
    function getStringProofOutput() {
        const proofJsonString = JSON.stringify(proofHandler.proof);
        const publicInputsJsonString = JSON.stringify(proofHandler.publicSignals);
        return `Proof:\n${proofJsonString}\n\nPublic Inputs:\n${publicInputsJsonString}`;
    }
    function showSpinner() {
        hideProof();
        spinner.style.display = "block";
    }
    function hideSpinner() {
        displayProof();
        spinner.style.display = "none";
    }
});
