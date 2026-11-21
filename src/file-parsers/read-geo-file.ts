import { convertIndToAmp } from './convert-ind-to-amp';
import { FileFormatError } from './file-format-error';

export const readGeoFile = (raw: Uint8Array): number[][] => {
  const ASCAN_HEADER_LENGTH_256_A = 267;
  const ASCAN_HEADER_LENGTH_512_A = 523;
  const ASCAN_HEADER_LENGTH_256_B = 270;
  const ASCAN_HEADER_LENGTH_512_B = 526;
  const METADATA_LENGTH = 16;

  const aScanHeaderPart = new Uint8Array([0xa1, 0x00]);
  const indices: number[] = [];
  const bScan: number[][] = [];

  for (let i = METADATA_LENGTH; i < raw.length - 2; i++) {
    if (raw[i] === aScanHeaderPart[0] && raw[i + 1] === aScanHeaderPart[1])
      indices.push(i);
  }
  const aScanDataAndHeaderLength =
    indices.length > 1 ? indices[1] - indices[0] : raw.length - indices[0];
  let aScanHeaderLength = 0;
  let aScanDataLength = 0;
  if (aScanDataAndHeaderLength === ASCAN_HEADER_LENGTH_256_A) {
    aScanHeaderLength = 10;
    aScanDataLength = 256;
  } else if (aScanDataAndHeaderLength === ASCAN_HEADER_LENGTH_512_A) {
    aScanHeaderLength = 10;
    aScanDataLength = 512;
  } else if (aScanDataAndHeaderLength === ASCAN_HEADER_LENGTH_256_B) {
    aScanHeaderLength = 13;
    aScanDataLength = 256;
  } else if (aScanDataAndHeaderLength === ASCAN_HEADER_LENGTH_512_B) {
    aScanHeaderLength = 13;
    aScanDataLength = 512;
  } else {
    throw new FileFormatError('UnrecognizedTraceLayout');
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
