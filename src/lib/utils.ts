
import { dirname } from 'path';

export const getRootProjectDirectory = () => {
    const currentPath = dirname(__filename);
    const parentPath = dirname(currentPath);
    const baseDirectory = dirname(parentPath);
    return baseDirectory;
}

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