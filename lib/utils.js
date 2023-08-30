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
exports.prettyPrintArray = exports.getVerificationKey = exports.consoleErrorEnable = exports.consoleErrorDisable = exports.getRootProjectDirectory = void 0;
const path_1 = require("path");
function getRootProjectDirectory() {
    // Check if the current file is in the build directory.
    const isInBuildDirectory = __dirname.includes("build");
    const currentPath = (0, path_1.dirname)(__filename);
    const parentPath = (0, path_1.dirname)(currentPath);
    const baseDirectory = (0, path_1.dirname)(parentPath);
    // If the current file is in the build directory, go one level up.
    if (isInBuildDirectory) {
        return (0, path_1.resolve)((0, path_1.dirname)(parentPath), "..");
    }
    return baseDirectory;
}
exports.getRootProjectDirectory = getRootProjectDirectory;
const consoleErrorDisable = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalConsoleError = console.error;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.error = () => { };
    return originalConsoleError;
};
exports.consoleErrorDisable = consoleErrorDisable;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const consoleErrorEnable = (originalConsoleError) => {
    console.error = originalConsoleError;
};
exports.consoleErrorEnable = consoleErrorEnable;
const getVerificationKey = (directory_extension = "build/src/public/") => __awaiter(void 0, void 0, void 0, function* () {
    return yield fetch(getRootProjectDirectory() + directory_extension + "verification_key.json").then(function (res) {
        return res.json();
    });
});
exports.getVerificationKey = getVerificationKey;
const prettyPrintArray = function (json) {
    if (typeof json === "string") {
        json = JSON.parse(json);
    }
    const output = JSON.stringify(json, function (k, v) {
        if (v instanceof Array)
            return JSON.stringify(v);
        return v;
    }, 2)
        .replace(/\\/g, " ")
        .replace(/"\[/g, "[")
        .replace(/\]"/g, "]")
        .replace(/"\{/g, "{")
        .replace(/\}"/g, "}");
    return output;
};
exports.prettyPrintArray = prettyPrintArray;
