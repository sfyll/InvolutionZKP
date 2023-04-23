document.addEventListener("DOMContentLoaded", () => {
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
            logMetadata();
        }
    });

    flipButton.addEventListener("click", () => {
        if (img) {
            flipImage();
            logMetadata();
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
            ctx.clearRect(0, 0, img.width, img.height);
            ctx.translate(img.width, 0);
            ctx.scale(-1, 1);
            drawImage(img);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformation matrix
            flipped = !flipped;
        }
    }

    function logMetadata() {
        const imageData = ctx?.getImageData(0, 0, img.width, img.height);
        const fileName = `${flipped ? "flipped" : "original"}_image_metadata.json`;
    
        if (imageData) {
            const pixels: number[][] = [];
            const jsonContent = {
                columns: img.width,
                rows: img.height,
                pixels: pixels
            };
    
            for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                    const index = (y * img.width + x) * 4;
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];
                    const a = imageData.data[index + 3];
                    jsonContent.pixels.push([r, g, b, a]);
                }
            }
            saveJSON(fileName, jsonContent);
        }
    }
    
    function saveJSON(filename: string, jsonContent: object) {
        const blob = new Blob([JSON.stringify(jsonContent)], { type: "application/json;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
