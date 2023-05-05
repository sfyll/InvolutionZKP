set -e

mkdir -p public
cp ../circuits/build/involution_js/involution.wasm ./public/involution.wasm
cp ../circuits/zkFiles/involution_final.zkey ./public/involution_final.zkey
cp ../circuits/zkFiles/verification_key.json ./public/verification_key.json

cd ../

npm run build