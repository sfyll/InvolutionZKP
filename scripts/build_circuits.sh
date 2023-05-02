#inspired from https://github.com/akinovak/circom2-example/blob/main/scripts/build-circuits.sh

cd "$(dirname "$0")"

mkdir -p ../circuits/build
mkdir -p ../circuits/zkFiles

cd ../circuits/build/

if [ -f ./powersOfTau28_hez_final_22.ptau ]; then
    echo "powersOfTau28_hez_final_22.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_22.ptau'
    curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_22.ptau
fi

circom ../involution.circom --r1cs --wasm --sym

npx snarkjs groth16 setup involution.r1cs powersOfTau28_hez_final_22.ptau involution_0000.zkey

npx snarkjs zkey contribute involution_0000.zkey involution_0001.zkey --name="Frist contribution" -v -e="Random entropy"
npx snarkjs zkey contribute involution_0001.zkey involution_0002.zkey --name="Second contribution" -v -e="Another random entropy"
npx snarkjs zkey beacon involution_0002.zkey involution_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

npx snarkjs zkey export verificationkey involution_final.zkey verification_key.json

cp verification_key.json ../zkFiles/verification_key.json
cp involution_js/involution.wasm ../zkFiles/involution.wasm
cp involution_final.zkey ../zkFiles/involution_final.zkey