import { createPngHandlerFromImageData } from "./lib/png_handler"
import { calculateProof } from "./lib/zk_handler"
import { createHash } from "crypto";

let proofHandler = {
    proof : null,
    publicSignals: {},
    verification: false,
    imageHash: "",
    proofOutputElement: ""
}

let png_handler: any;
let isFlipped = false;


document.addEventListener("DOMContentLoaded", () => {
    const warningModal = document.getElementById("warningModal") as HTMLElement;
    warningModal.style.display = "block";

    const inputImage = document.getElementById("inputImage") as HTMLInputElement;
    const closeModal = document.querySelector(".close") as HTMLElement;
    const okButton = document.getElementById("okButton") as HTMLButtonElement;
    const openFilePicker = new Event("openFilePicker");

    const flipButtonHandler = document.getElementById("flipButton") as HTMLButtonElement;
    const canvas = document.getElementById("imageCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const copyProofButton = document.getElementById("copyProof") as HTMLButtonElement;
    const proofOutputElement = document.getElementById("proofOutput") as HTMLTextAreaElement;

    const verifyProofButton = document.getElementById("verifyProof") as HTMLButtonElement;
    const verificationResult = document.getElementById("verificationResult") as HTMLTextAreaElement;
  
    let img: HTMLImageElement;

    closeModal.addEventListener("click", () => {
        warningModal.style.display = "none";
    });
    
    window.addEventListener("click", (event) => {
        if (event.target === warningModal) {
            warningModal.style.display = "none";
        }
    });
  
    okButton.addEventListener("click", () => {
        warningModal.style.display = "none";
        inputImage.dispatchEvent(openFilePicker); 
    });


    inputImage.addEventListener("change", async (e) => {
        e.stopImmediatePropagation()
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file && file.type === "image/png") {
            img = await loadImage(file);
            drawImage(img);

            if (ctx) {
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                png_handler = createPngHandlerFromImageData(imageData);
            }

            // Reset the transformation matrix for the new image
            if (isFlipped) {
                canvas.style.transform = '';
                isFlipped = false;
            }
        }
        });
  
    flipButtonHandler.addEventListener("click", async (e)  => {
        e.stopImmediatePropagation()
        if (img) {        
            flipImage();
            await populateProofHandler();

    }});

    copyProofButton.addEventListener("click", (e) => {
        e.stopImmediatePropagation()
        if (proofHandler.proof && proofHandler.publicSignals && proofHandler.verification) {
          const proofJsonString = JSON.stringify(proofHandler.proof);
          const publicInputsJsonString = JSON.stringify(proofHandler.publicSignals);
          proofOutputElement.value = `Proof:\n${proofJsonString}\n\nPublic Inputs:\n${publicInputsJsonString}`;
          proofHandler.proofOutputElement = `Proof:\n${proofJsonString}\n\nPublic Inputs:\n${publicInputsJsonString}`;
    
          proofOutputElement.select();
          document.execCommand("copy");
        }
      });

    verifyProofButton.addEventListener("click", (e) => {
        e.stopImmediatePropagation()
    if (proofHandler.proof && proofHandler.publicSignals && proofHandler.verification &&
        proofHandler.proofOutputElement == proofOutputElement.value) {
        const currentImageHash = generateImageHash(ctx.getImageData(0, 0, img.width, img.height));
        if (currentImageHash === proofHandler.imageHash) {
            verificationResult.textContent = `Proof validation result is: ${proofHandler.verification}`
        } else {
        verificationResult.textContent = "Error: The image has been changed. Please regenerate the proof.";
        }
    } else {
        verificationResult.textContent = "Proof validation result is false";
    }
    });
  

    async function loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    function drawImage(img: HTMLImageElement) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
    }

    function flipImage() {
        if (ctx) {
            canvas.style.transform = isFlipped ? '' : 'rotate(180deg)';
            isFlipped = !isFlipped;
        }
    }

    async function populateProofHandler() {
        if (png_handler) {
            const result = await calculateProof(png_handler);

            proofHandler.proof = result.proof;
            proofHandler.publicSignals = result.publicSignals;
            proofHandler.verification = result.verification;
            proofHandler.imageHash = generateImageHash(ctx.getImageData(0, 0, img.width, img.height)); 
            displayProof();
        }
    }

    function displayProof() {
        if (proofHandler.proof && proofHandler.publicSignals && proofHandler.verification) {
            const proofJsonString = JSON.stringify(proofHandler.proof);
            proofOutputElement.textContent = proofJsonString;
            }
      }

    function generateImageHash(imageData: ImageData): string {
        const hash = createHash("sha256");
        hash.update(new Uint8Array(imageData.data.buffer));
        return hash.digest("hex");
    }

    }
)

