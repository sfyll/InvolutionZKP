# InvolutionZKP

An example of a zero-knowledge encryption use case whereby computations get delegated to the server and the client just has to verify the received proof.

Presently, the server flips a PNG image upside down upon the user's request and sends a proof of Involution that can be validated within the browser.

## Installation

To set up the InvolutionZKP project, you'll need to have the following tools installed:

- Node.js
- NPM (Node Package Manager)
- Rust
- Circom

### Quick Start

1. Clone the repository and navigate to the project root directory:

```
git clone https://github.com/SFYLL/InvolutionZKP.git
cd InvolutionZKP
```


2. Install the required dependencies:

```
npm install
```

3. Run the project

```
./run.sh
```

## Contributing

Pull requests are welcome. Please make sure to update tests as appropriate. If you want to play around with this project, here are some leads:

- Optimize the circuits so that it can run on higher definition PNGs;
- Increase the circuit modularity, allowing users to define their own involutive functions;
- Implement recursive ZK-proofs. That way, as you bundle involutive functions together the complexity of reverse engineering each function grows exponentially.
    
