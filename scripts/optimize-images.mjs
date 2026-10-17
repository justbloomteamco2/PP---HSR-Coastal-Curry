import { mkdir, stat } from "node:fs/promises";
import { basename, join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = join(root, "src", "Gen");
const outputDirectory = join(root, "public", "images", "generated");
const sources = [
  "Daylight HSR Coastal Curry Entrance.png",
  "Nighttime Coastal Curry Restaurant Entrance.png",
  "Rustic Spicy Prawn Masala.png",
  "Rustic Spiced Chicken Curry Bowl.png",
  "Motion/Spicy Prawn Masala in Brass Kadai.png",
  "Rustic South Indian Crepes with Chutneys.png",
  "chicken-and-roti.jpeg",
  "mixed-vegetable-dish.jpeg",
  "South Indian Banana Leaf Feast.png",
  "fish-curry-platter.jpeg",
  "fish-on-banana-leaf.jpeg",
  "fish-platter-with-garnish.jpeg",
  "whole-fish-platter.jpeg",
  "tandoori-chicken-roast.jpeg",
  "tandoori-chicken-platter.jpeg",
  "green-herb-kebabs.jpeg",
];

await mkdir(outputDirectory, { recursive: true });

for (const source of sources) {
  const name = parse(basename(source)).name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const output = join(outputDirectory, `${name}.webp`);
  await sharp(join(sourceDirectory, source))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(output);
  const { size } = await stat(output);
  process.stdout.write(
    `Optimized ${source} -> ${output} (${Math.round(size / 1024)} KB)\n`,
  );
}
