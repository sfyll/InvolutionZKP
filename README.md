# InvolutionZKP

An example of zero-knowledge usecase. 

The server flips upside-down a PNG upon the user's request and sends a proof of Involution that can be validated within the browser.

## Installation

- Node
- NPM (Javascript Package Manager)
- Rust
- Circom

Then simply go into the project root directory and ```./run.sh```

## Contributing

Pull requests are welcome. Please make sure to update tests as appropriate. If you want to play around with this project, here are some leads:

    - Optimize the circuits so that it can run on higher definition png, in browser via WASM (no circuit compilation into cpp allowed as it won't run on all machine, namely mac chips);
    - Increase the circuit modularity, allowing users to define their own involutive functions;
    - Implement recursive ZK-proofs. That way, as you bundle involutive functions together the complexity of reverse engineering each functions grows exponentially.
