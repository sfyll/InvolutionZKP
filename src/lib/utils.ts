
import { dirname, resolve } from 'path';

export function getRootProjectDirectory(): string {
  // Check if the current file is in the build directory.
  const isInBuildDirectory = __dirname.includes('build');
  const currentPath = dirname(__filename);
  const parentPath = dirname(currentPath);
  const baseDirectory = dirname(parentPath);

  // If the current file is in the build directory, go one level up.
  if (isInBuildDirectory) {
    return resolve(dirname(parentPath), '..');
  }

  return baseDirectory;
}

export const consoleErrorDisable = () => {
  // Store the original console.error
  const originalConsoleError: (...data: any[]) => void = console.error;

  // Replace console.error with an empty function
  console.error = () => {};

  return originalConsoleError;
};

export const consoleErrorEnable = (originalConsoleError: (...data: any[]) => void) => {
  console.error = originalConsoleError;
};

export const getVerificationKey = async () => {
    return await fetch(getRootProjectDirectory()+"/circuits/zkFiles/verification_key.json").then(function(res) {
      return res.json();
    });
  }

export const prettyPrintArray = function (json: string | number[][]) {
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }
  let output = JSON.stringify(json, function(k,v) {
    if(v instanceof Array)
      return JSON.stringify(v);
    return v;
  }, 2).replace(/\\/g, ' ')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}');

  return output;
}