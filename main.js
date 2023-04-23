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
document.addEventListener("DOMContentLoaded", () => {
    const inputImage = document.getElementById("inputImage");
    const flipButton = document.getElementById("flipImage");
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d");
    let img;
    let flipped = false;
    inputImage.addEventListener("change", (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file && file.type === "image/png") {
            img = yield loadImage(file);
            drawImage(img);
            logMetadata();
        }
    }));
    flipButton.addEventListener("click", () => {
        if (img) {
            flipImage();
            logMetadata();
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
            ctx.clearRect(0, 0, img.width, img.height);
            ctx.translate(img.width, 0);
            ctx.scale(-1, 1);
            drawImage(img);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformation matrix
            flipped = !flipped;
        }
    }
    function logMetadata() {
        const imageData = ctx === null || ctx === void 0 ? void 0 : ctx.getImageData(0, 0, img.width, img.height);
        const fileName = `${flipped ? "flipped" : "original"}_image_metadata.json`;
        if (imageData) {
            const pixels = [];
            const jsonContent = {
                columns: img.width,
                rows: img.height,
                pixels: pixels
            };
            for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                    const index = (y * img.width + x) * 4;
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];
                    const a = imageData.data[index + 3];
                    jsonContent.pixels.push([r, g, b, a]);
                }
            }
            saveJSON(fileName, jsonContent);
        }
    }
    function saveJSON(filename, jsonContent) {
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
});
