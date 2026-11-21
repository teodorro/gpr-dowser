import { convertIndToAmp } from './convert-ind-to-amp';

export const readGemFile = (raw: Uint8Array): number[][] => {
  const METADATA_LENGTH = 514;
  const METADATA_START_LENGTH = 16;
  const ASCAN_HEADER_LENGTH = 112;
  const ASCAN_DATA_LENGTH = 512;

  const bScanLengthArray = Array.from(
    raw.slice(METADATA_START_LENGTH, METADATA_START_LENGTH + 2),
  );
  const bScanLength = bScanLengthArray[1] + bScanLengthArray[0] * 256;
  const bScan: number[][] = [];

  for (let i = 0; i < bScanLength; i++) {
    const ind = METADATA_LENGTH + i * (ASCAN_HEADER_LENGTH + ASCAN_DATA_LENGTH);
    const aScan = raw.slice(ind, ind + ASCAN_DATA_LENGTH);
    bScan.push(Array.from(aScan));
  }

  // To check values if needed
  // const x = bScan.flat();
  // const y = new Set(x);
  // const z = [...y].sort((a, b) => a - b);
  // const maxValue = Math.max(...bScan.map((x) => Math.max(...x)));

  getRidOfEmptyAScans(bScan);
  getRidOfTwoStepKrotFormat(bScan);
  convertIndicesToAmplitudes(bScan);

  return bScan;
};

const getRidOfTwoStepKrotFormat = (bScan: number[][]) => {
  bScan.forEach((aScan) => {
    for (let i = 0; i < aScan.length; i++) {
      aScan[i] = Math.max(Math.round(aScan[i] / 2 - 1), 0);
    }
  });
};

const convertIndicesToAmplitudes = (bScan: number[][]) => {
  bScan.forEach((aScan) => {
    for (let i = 0; i < aScan.length; i++) {
      aScan[i] = convertIndToAmp(aScan[i]);
    }
  });
};

const getRidOfEmptyAScans = (bScan: number[][]) => {
  const filteredBScan = bScan.filter((aScan) => {
    return aScan.some((value) => value !== 0);
  });
  bScan.length = 0;
  bScan.push(...filteredBScan);
};
