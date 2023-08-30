import { dirname, resolve } from "path";

export function getRootProjectDirectory(): string {
  // Check if the current file is in the build directory.
  const isInBuildDirectory = __dirname.includes("build");
  const currentPath = dirname(__filename);
  const parentPath = dirname(currentPath);
  const baseDirectory = dirname(parentPath);

  // If the current file is in the build directory, go one level up.
  if (isInBuildDirectory) {
    return resolve(dirname(parentPath), "..");
  }

  return baseDirectory;
}

export const consoleErrorDisable = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalConsoleError: (...data: any[]) => void = console.error;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.error = () => {};

  return originalConsoleError;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const consoleErrorEnable = (
  originalConsoleError: (...data: any[]) => void
) => {
  console.error = originalConsoleError;
};

export const getVerificationKey = async (
  directory_extension = "./public/"
) => {
  return await fetch(
    getRootProjectDirectory() + directory_extension + "verification_key.json"
  ).then(function (res) {
    return res.json();
  });
};

export const prettyPrintArray = function (json: string | number[][]) {
  if (typeof json === "string") {
    json = JSON.parse(json);
  }
  const output = JSON.stringify(
    json,
    function (k, v) {
      if (v instanceof Array) return JSON.stringify(v);
      return v;
    },
    2
  )
    .replace(/\\/g, " ")
    .replace(/"\[/g, "[")
    .replace(/\]"/g, "]")
    .replace(/"\{/g, "{")
    .replace(/\}"/g, "}");

  return output;
};
