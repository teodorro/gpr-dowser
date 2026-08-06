import * as d3 from 'd3';

export const getPalette = (palette: string | undefined): Uint8ClampedArray => {
  if (palette == undefined) return makeLut256(d3.interpolateGreys);
  switch (palette) {
    case 'greys':
      return makeLut256(d3.interpolateGreys);
    case 'viridis':
      return makeLut256(d3.interpolateViridis);
    case 'turbo':
      return makeLut256(d3.interpolateTurbo);
    case 'spectral':
      return makeLut256(d3.interpolateSpectral);
    case 'cubehelix':
      return makeLut256(d3.interpolateCubehelixDefault);
    case 'magma':
      return makeLut256(d3.interpolateMagma);
    case 'sinebow':
      return makeLut256(getSinebowPalette());
    case 'rainbow':
      return makeLut256(getRainbowPalette());
    default:
      return makeLut256(d3.interpolateGreys);
  }
};

const makeLut256 = (interp: (t: number) => string): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const c = d3.rgb(interp(t));
    lut[i * 4 + 0] = c.r;
    lut[i * 4 + 1] = c.g;
    lut[i * 4 + 2] = c.b;
    lut[i * 4 + 3] = 255;
  }
  return lut;
};

export const getPaletteRaw = (palette: string): ((t: number) => string) => {
  switch (palette) {
    case 'greys':
      return d3.interpolateGreys;
    case 'viridis':
      return d3.interpolateViridis;
    case 'turbo':
      return d3.interpolateTurbo;
    case 'spectral':
      return d3.interpolateSpectral;
    case 'cubehelix':
      return d3.interpolateCubehelixDefault;
    case 'magma':
      return d3.interpolateMagma;
    case 'sinebow':
      return getSinebowPalette();
    case 'rainbow':
      return getRainbowPalette();
    default:
      return d3.interpolateGreys;
  }
};

const getSinebowPalette = (): ((t: number) => string) => {
  const n = 16;
  const colors = d3.quantize(d3.interpolateSinebow, n);
  const tail = d3.quantize(d3.interpolateRgb('purple', 'black'), 5);
  colors.splice(n - 5, 5, ...tail);
  const head = d3.quantize(d3.interpolateRgb('red', 'lightgreen'), 5);
  colors.splice(0, 5, ...head);
  const custom = d3.interpolateRgbBasis(colors);
  return (t) => custom(1 - t);
};

const getRainbowPalette = (): ((t: number) => string) => {
  const n = 16;
  const colors = d3.quantize(d3.interpolateRainbow, n);
  // const tail = d3.quantize(d3.interpolateRgb('purple', 'black'), 5);
  // colors.splice(n - 5, 5, ...tail);
  const head = d3.quantize(d3.interpolateRgb('black', '#DA588D'), 5);
  colors.splice(0, 5, ...head);
  const custom = d3.interpolateRgbBasis(colors);
  return (t) => custom(1 - t);
};

export default getPalette;
