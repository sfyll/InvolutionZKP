import { groth16 } from "snarkjs";
import { PngHandler } from "./png_handler";
import { getRootProjectDirectory, getVerificationKey } from "./utils";

export const calculateProof = async function (
  imageData: PngHandler,
  directory_extension = "build/src/public/"
) {
  const directory = getRootProjectDirectory() + directory_extension;

  const matrixInputs: string[] = imageData.convertToProofTest();

  const witness = {
    rows: imageData.rows,
    columns: imageData.pixelsPerRow,
    image: matrixInputs
  };

  const { proof, publicSignals } = await groth16.fullProve(
    witness,
    directory + "involution.wasm",
    directory + "involution_final.zkey"
  );

  const res = await checkProof(proof, publicSignals);

  return {
    proof: proof,
    publicSignals: publicSignals,
    verification: res
  };
};

export const checkProof = async function (
  proof: string,
  publicSignals: string[]
) {
  const vKey = await getVerificationKey();

  const res = await groth16.verify(vKey, publicSignals, proof);
  return res;
};
