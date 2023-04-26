pragma circom 2.1.4;
include "../node_modules/circomlib/circuits/comparators.circom";

function ReverseImage(rowsMax, columnsMax, image) {
    var reversedImage[256][256];

    for (var i = 0; i < rowsMax; i++) {
        for (var j = 0; j < columnsMax; j++) {
            reversedImage[rowsMax - i - 1][j] = image[i][j];
        }
    }
    return reversedImage;
}

template VerifyImageBounds() {
    signal input rows;
    signal input columns;
    signal input rowsMax;
    signal input columnsMax;
  
    // Ensure that both values are positive.
    component n2b1 = Num2Bits(12);
    n2b1.in <== rows;

    component n2b2 = Num2Bits(12);
    n2b2.in <== columns;

    component rowCheck = LessEqThan(12);
    rowCheck.in[0] <== rows;
    rowCheck.in[1] <== rowsMax;
    rowCheck.out === 1;

    component columnCheck = LessEqThan(12);
    columnCheck.in[0] <== columns;
    columnCheck.in[1] <== columnsMax;
    columnCheck.out === 1;
}

template Involution(rowsMax, columnsMax) {
    //public inputs: assumes these jpegs are on-chain, we need to enforce that involution happens over
    //the whole picture and nost just a subset !
    //get constants
    signal input rows;
    signal input columns;
    
    //private inputs
    signal input image[rowsMax][columnsMax];

    signal output out[rowsMax][columnsMax];

    component verifyImage = VerifyImageBounds();

    verifyImage.rows <== rows;
    verifyImage.columns <== columns;
    verifyImage.rowsMax <== rowsMax;
    verifyImage.columnsMax <== columnsMax;

    var intermediary[rowsMax][columnsMax] = ReverseImage(rowsMax, columnsMax, image);

    var involutedMatrix[rowsMax][columnsMax] = ReverseImage(rowsMax, columnsMax, intermediary);

    for (var i = 0; i < rowsMax; i++) {
        for (var j = 0; j < columnsMax; j++) {
            involutedMatrix[i][j] === image[i][j];
            out[i][j] <== intermediary[i][j];
        }
    }
}
component main {public [rows,columns]} = Involution(256, 256);

/* INPUT = {
    "rows": "2",
    "columns": "3",
    "image": [["1","2","3"],["4","5","6"]],
} */