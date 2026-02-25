/**
 * One-off script: decode PromptPay QR image to see the payload string.
 * Run: node scripts/decode-promptpay-qr.mjs <path-to-qr-image.png>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jsQR from "jsqr";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = process.argv[2] || path.join(__dirname, "../.cursor/projects/Users-jirapornkahaloon-cashew-shop/assets/promptpay-qr-55af34a8-61de-4682-a22f-45a149aa81e3.png");

if (!fs.existsSync(imagePath)) {
  console.error("Image not found:", imagePath);
  process.exit(1);
}

const buffer = fs.readFileSync(imagePath);
const { data, info } = await sharp(buffer)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
// sharp raw output is RGBA when ensureAlpha(); copy to Uint8ClampedArray for jsQR
const rgba = new Uint8ClampedArray(data);
const code = jsQR(rgba, info.width, info.height, { inversionAttempts: "attemptBoth" });

if (code) {
  console.log("Decoded QR data:\n", code.data);
} else {
  console.log("No QR code found.");
}
