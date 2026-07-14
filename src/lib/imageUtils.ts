export async function cropGrid(base64Image: string, rows: number, cols: number, expectedCount: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cellWidth = Math.floor(img.width / cols);
      const cellHeight = Math.floor(img.height / rows);
      const croppedImages: string[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (croppedImages.length >= expectedCount) break;
          
          const canvas = document.createElement("canvas");
          canvas.width = cellWidth;
          canvas.height = cellHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject("No 2d context");
            return;
          }

          ctx.drawImage(
            img,
            c * cellWidth,
            r * cellHeight,
            cellWidth,
            cellHeight,
            0,
            0,
            cellWidth,
            cellHeight
          );

          croppedImages.push(canvas.toDataURL("image/jpeg", 0.9));
        }
      }
      resolve(croppedImages);
    };
    img.onerror = reject;
    img.src = base64Image;
  });
}

export interface CropBox {
  id?: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function cropGridCustom(
  base64Image: string,
  boxes: CropBox[],
  expectedCount: number
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const croppedImages: string[] = [];

      for (let i = 0; i < Math.min(boxes.length, expectedCount); i++) {
          const box = boxes[i];
          const startX = Math.floor((box.x / 100) * width);
          const endX = Math.floor(((box.x + box.w) / 100) * width);
          const startY = Math.floor((box.y / 100) * height);
          const endY = Math.floor(((box.y + box.h) / 100) * height);

          const cellW = endX - startX;
          const cellH = endY - startY;

          if (cellW <= 0 || cellH <= 0) continue;

          const canvas = document.createElement("canvas");
          canvas.width = cellW;
          canvas.height = cellH;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, startX, startY, cellW, cellH, 0, 0, cellW, cellH);
            croppedImages.push(canvas.toDataURL("image/jpeg", 0.9));
          }
      }
      resolve(croppedImages);
    };
    img.onerror = reject;
    img.src = base64Image;
  });
}

export function getGridDimensions(count: number): { rows: number, cols: number } {
  switch (count) {
    case 4: return { rows: 2, cols: 2 };
    case 6: return { rows: 2, cols: 3 };
    case 8: return { rows: 2, cols: 4 };
    case 9: return { rows: 3, cols: 3 };
    case 12: return { rows: 3, cols: 4 };
    case 16: return { rows: 4, cols: 4 };
    default: return { rows: 2, cols: 2 };
  }
}

export function downloadImage(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadAllImages(images: { url: string; action: string }[], prefix: string) {
  images.forEach((img, index) => {
    // Add small delay to avoid browser blocking multiple downloads
    setTimeout(() => {
      downloadImage(img.url, `${prefix.replace(/[^a-zA-Z0-9]/g, '_')}_${img.action.replace(/[^a-zA-Z0-9]/g, '_')}_${index}.png`);
    }, index * 200);
  });
}
