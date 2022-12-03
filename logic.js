const cnv = document.getElementById("cnv");
const ctx = cnv.getContext("2d");
const width = cnv.width = 600;
const height = cnv.height = 600;
const img = ctx.createImageData(width, height);
const imgData = img.data;

const waveHeight = [];
const waveVelocity = [];
const pixelMass = [];
const accumulatedLight = [];

const ACCUMULATED_EXPOSURE = 0.0005;
const GLASS_COLORS = [50, 60, 70];
const COLOR_SHIFT = [0.02, 0.0, -0.04];

let frame = 0;

for (let i = 0; i < width; i++) {
    waveHeight.push([]);
    waveVelocity.push([]);
    accumulatedLight.push([]);
    pixelMass.push([]);
    for (let j = 0; j < height; j++) {
        waveHeight[i][j] = [0, 0, 0];
        waveVelocity[i][j] = [0, 0, 0];
        accumulatedLight[i][j] = [0, 0, 0];
        pixelMass[i][j] = 1;
        if(Math.sqrt((i - width / 2) ** 2 + (j - height / 2) ** 2) < 100) pixelMass[i][j] = 3 / 4;
    }
}

window.requestAnimationFrame(update);

function update() {
    if(frame < 300) {
        for (let j = height / 2 - 50; j < height / 2; j++) {
            for (let k = 0; k < 3; k++) {
                waveHeight[165][j - 50][k] = Math.sin(frame * 0.8) * 12;
            }
        }
    }
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let dataIndex = (i + j * width) * 4;
            for (let k = 0; k < 3; k++) {
                waveHeight[i][j][k] += waveVelocity[i][j][k];
                accumulatedLight[i][j][k] += Math.abs(waveHeight[i][j][k]) * ACCUMULATED_EXPOSURE;
                let colorValue = Math.pow(Math.min(accumulatedLight[i][j][k], 1), 2) * 255;
                if(pixelMass[i][j] < 1) colorValue = Math.min(colorValue + GLASS_COLORS[k], 255);
                imgData[dataIndex + k] = colorValue;
            }
            imgData[dataIndex + 3] = 255;
        }
    }
    for (let i = 1; i < width - 1; i++) {
        for (let j = 1; j < height - 1; j++) {
            for (let k = 0; k < 3; k++) {
                let speed = pixelMass[i][j] - COLOR_SHIFT[k];
                let force = waveHeight[i - 1][j][k] + waveHeight[i + 1][j][k] + waveHeight[i][j - 1][k] + waveHeight[i][j + 1][k];
                waveVelocity[i][j][k] += (force / 4 - waveHeight[i][j][k]) * speed;
            }
        }
    }
    ctx.putImageData(img, 0, 0);
    frame++;
    window.requestAnimationFrame(update);
}