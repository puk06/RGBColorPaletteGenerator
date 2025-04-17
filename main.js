const sharp = require("sharp");
const { createCanvas } = require("canvas");

const color_width = 500;
const color_height = 750;

const lightness_width = 750;
const lightness_height = 500;

// メイン処理
(async () => {
	try {
		const colorGradient = GenerateColorGradient(color_width, color_height);
		const lightnessGradient = GenerateLightnessGradient(lightness_width, lightness_height);

		await CombineImages(colorGradient, lightnessGradient);
	} catch (error) {
		console.error("エラー:", error);
	}
})();

function GenerateColorGradient(width, height) {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	const gradient = ctx.createLinearGradient(0, 0, 0, height);

	gradient.addColorStop(0, "rgb(255, 255, 255)");
	gradient.addColorStop(1 / 7, "rgb(255, 0, 0)");
	gradient.addColorStop(2 / 7, "rgb(255, 0, 255)");
	gradient.addColorStop(3 / 7, "rgb(0, 0, 255)");
	gradient.addColorStop(4 / 7, "rgb(0, 255, 255)");
	gradient.addColorStop(5 / 7, "rgb(0, 255, 0)");
	gradient.addColorStop(6 / 7, "rgb(255, 255, 0)");
	gradient.addColorStop(1, "rgb(255, 0, 0)");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	return sharp(canvas.toBuffer())
		.rotate(-90);
}

function GenerateLightnessGradient(width, height) {
	const data = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const brightness = Math.floor((y / (height - 1)) * 255);

            data[index] = 255 - brightness;
            data[index + 1] = 255 - brightness;
            data[index + 2] = 255 - brightness;
            data[index + 3] = Math.abs(255 - brightness * 2);
        }
    }

    return sharp(data, {
        raw: {
            width: width,
            height: height,
            channels: 4,
        },
    })
	.toFormat("png");
}

async function CombineImages(image1, image2) {
	await Promise.all([image1.metadata(), image2.metadata()]);
	await image1
		.composite([
			{
				input: await image2.toBuffer(),
				top: 0,
				left: 0,
			},
		])
		.toFile("combined_image.png");
	console.log("画像の作成が完了しました。");
}
