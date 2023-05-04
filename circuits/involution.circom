pragma circom 2.1.4;
include "../node_modules/circomlib/circuits/comparators.circom";

function ReverseImage(rowsMax, columnsMax, image) {
    var reversedImage[50][200];

    for (var i = 0; i < rowsMax; i++) {
        for (var j = 0; j < columnsMax; j++) {
            reversedImage[rowsMax - i - 1][j] = image[i][j];
        }
    }
    return reversedImage;
}

template VerifyImageBounds(rowsMax, columnsMax) {
    signal input rows;
    signal input columns;
    signal input image[rowsMax][columnsMax];

    signal output out;
  
    // Ensure that both values are positive.
    component n2b1 = Num2Bits(12);
    n2b1.in <== rows;

    component n2b2 = Num2Bits(12);
    n2b2.in <== columns;

    //ensure that actual image rows < rows max boundary
    component rowCheck = LessEqThan(12);
    rowCheck.in[0] <== rows;
    rowCheck.in[1] <== rowsMax;
    rowCheck.out === 1;

    //ensure that actual image columns < columns max boundary
    component columnCheck = LessEqThan(12);
    columnCheck.in[0] <== columns;
    columnCheck.in[1] <== columnsMax;
    columnCheck.out === 1;

    //verify that the difference between rows, columns and their respective max (i.e. the padding) is only made of 0!
    var intermediary_sum = 0;
    
    for (var i = rows; i < rowsMax; i++) {
        for (var j = columns ; j < columnsMax; j++) {
            intermediary_sum += image[i][j];
        }
    }

    signal sum <-- intermediary_sum;

    component areEqual = IsZero();
    areEqual.in <== sum;
    areEqual.out === 1;

    out <== sum + areEqual.out;
}

template VerifyMatrixEquality(rowsMax, columnsMax) {
    signal input matrix_a[rowsMax][columnsMax];
    signal input matrix_b[rowsMax][columnsMax];
    
    //out is 1 if matrixes are equal
    signal output out;

    var intermediary_sum = 0;

    for (var i = 0; i < rowsMax; i++) {
        for (var j = 0; j < columnsMax; j++) {
            var isNotEqual = matrix_a[i][j] - matrix_b[i][j] == 0 ? 0 : 1;
            intermediary_sum += isNotEqual;
        }
    }

    signal sum <-- intermediary_sum;

    component areEqual = IsZero();
    areEqual.in <== sum;
    areEqual.out === 1;

    out <== sum + areEqual.out;
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

    component verifyImage = VerifyImageBounds(rowsMax, columnsMax);

    verifyImage.rows <== rows;
    verifyImage.columns <== columns;
    verifyImage.image <== image;
    verifyImage.out === 1;

    signal intermediaryMatrix[rowsMax][columnsMax] <== ReverseImage(rowsMax, columnsMax, image);

    signal involutedMatrix[rowsMax][columnsMax] <== ReverseImage(rowsMax, columnsMax, intermediaryMatrix);

    component verifyMatrixEquality = VerifyMatrixEquality(rowsMax, columnsMax);

    verifyMatrixEquality.matrix_a <== image;
    verifyMatrixEquality.matrix_b <== involutedMatrix;

    verifyMatrixEquality.out === 1;

    out <== intermediaryMatrix;
}


component main {public [rows,columns]} = Involution(50, 200);

/* INPUT = {
    "rows": "3",
    "columns": "4",
    "image": ["1", "2", "3", "4", "5", "6", "7", "8", "0", "0", "0", "0"]
} */