set -e

cd scripts/

./build_circuits.sh

cd ../src/

./run.sh

cd ../

npx webpack serve 
