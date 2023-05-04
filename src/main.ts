import { PngHandler, createPngHandlerFromImageData } from "./lib/png_handler"
import { calculateProof } from "./lib/zk_handler"

let proofData: any;
let verificationResult: boolean;
let png_handler: any;

document.addEventListener("DOMContentLoaded", () => {
    console.log("LOADING")
    console.log("Current URL: ", window.location.href);
    const inputImage = document.getElementById("inputImage") as HTMLInputElement;
    const flipButton = document.getElementById("flipImage") as HTMLButtonElement;
    const canvas = document.getElementById("imageCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
  
    let img: HTMLImageElement;
    let flipped = false;
  
    inputImage.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
  
      if (file && file.type === "image/png") {
        img = await loadImage(file);
        drawImage(img);
  
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          png_handler = createPngHandlerFromImageData(imageData);
        }
      }
    });
  
    flipButton.addEventListener("click", async () => {
        if (img) {
            await flipImage();
        if (png_handler) {
            const result = await calculateProof(png_handler);
            proofData = result.proof;
            verificationResult = result.verification;
            }
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
            canvas.style.transform = 'rotate(180deg)';
        }
    }

    // function flipImage() {
    //     if (ctx) {
    //         ctx.clearRect(0, 0, img.width, img.height);
    //         ctx.translate(img.width, 0);
    //         ctx.scale(-1, 1);            
    //         drawImage(img);
    //         ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformation matrix
    //         flipped = !flipped;
    //         console.log("FLIPPED")
    //     }
    // }
});
