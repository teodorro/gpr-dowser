import { convertIndToAmp } from "./convert-ind-to-amp";

export const readGeoFile = (raw: Uint8Array): number[][] => {
  const aScanHeaderPart = new Uint8Array([0xa1, 0x00]);
  const indices: number[] = [];
  const bScan: number[][] = [];

  for (let i = 16; i < raw.length - 2; i++) {
    if (raw[i] === aScanHeaderPart[0] && raw[i + 1] === aScanHeaderPart[1])
      indices.push(i);
  }
  const aScanDataAndHeaderLength =
    indices.length > 1 ? indices[1] - indices[0] : raw.length - indices[0];
  let aScanHeaderLength = 0;
  let aScanDataLength = 0;
  if (aScanDataAndHeaderLength === 267) {
    aScanHeaderLength = 10;
    aScanDataLength = 256;
  } else if (aScanDataAndHeaderLength === 523) {
    aScanHeaderLength = 10;
    aScanDataLength = 512;
  } else if (aScanDataAndHeaderLength === 270) {
    aScanHeaderLength = 13;
    aScanDataLength = 256;
  } else if (aScanDataAndHeaderLength === 526) {
    aScanHeaderLength = 13;
    aScanDataLength = 512;
  } else {
    throw new Error("Ошибка чтения файла");
  }

  indices.forEach((index) => {
    const aScan = raw.slice(
      index + aScanHeaderLength,
      index + aScanHeaderLength + aScanDataLength,
    );
    bScan.push(Array.from(aScan));
  });

  convertIndicesToAmplitudes(bScan);

  return bScan;
};

const convertIndicesToAmplitudes = (bScan: number[][]) => {
  bScan.forEach((aScan) => {
    for (let i = 0; i < aScan.length; i++) {
      aScan[i] = convertIndToAmp(aScan[i]);
    }
  });
};
