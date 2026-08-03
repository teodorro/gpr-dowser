import savitzkyGolay from 'ml-savitzky-golay';

export const savGolayFilter = (
  data: number[][],
  horizontalWindowSize: number,
  horizontalPolynomial: number,
  verticalWindowSize: number,
  verticalPolynomial: number,
): number[][] => {
  const vData = verticalSavGolayFilter(data, {
    windowSize: verticalWindowSize,
    polynomial: verticalPolynomial,
  });
  const fullData = horizontalSavGolayFilter(vData, {
    windowSize: horizontalWindowSize,
    polynomial: horizontalPolynomial,
  });
  return fullData;
};

const verticalSavGolayFilter = (
  data: number[][],
  options?: { h?: number; windowSize?: number; polynomial?: number },
): number[][] => {
  const windowSize = options?.windowSize ?? 11;
  const polynomial = options?.polynomial ?? 3;
  const h = options?.h ?? 1;
  const processedData: number[][] = data.map((ascan) => {
    const smoothedAscan = savitzkyGolay(ascan, h, {
      derivative: 0,
      windowSize,
      polynomial,
      pad: 'pre',
      padValue: 'replicate',
    });
    return smoothedAscan;
  });
  return processedData;
};

const horizontalSavGolayFilter = (
  data: number[][],
  options?: { h?: number; windowSize?: number; polynomial?: number },
): number[][] => {
  const windowSize = options?.windowSize ?? 11;
  const polynomial = options?.polynomial ?? 3;
  const h = options?.h ?? 1;

  const rotatedData = data[0].map((_, colIndex) =>
    data.map((row) => row[colIndex]),
  );

  const processedRotatedData: number[][] = rotatedData.map((row) => {
    const smoothedRow = savitzkyGolay(row, h, {
      derivative: 0,
      windowSize,
      polynomial,
      pad: 'pre',
      padValue: 'replicate',
    });
    return smoothedRow;
  });

  const processedData = processedRotatedData[0].map((_, colIndex) =>
    processedRotatedData.map((row) => row[colIndex]),
  );

  return processedData;
};
