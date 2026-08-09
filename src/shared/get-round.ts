import i18n from '@/i18n';

export const getRound = (
  value: number,
  afterDot: number = 2,
  division: boolean = true,
  language: string = i18n.language,
  dot?: string,
): string => {
  if (Number.isNaN(value)) {
    return 'NaN';
  }

  if (!Number.isFinite(value)) {
    const label = i18n.t('InfinityValue', { lng: language });
    return value < 0 ? `-${label}` : label;
  }

  const factor = 10 ** afterDot;
  const scaled = Math.round(value * factor);
  const negative = scaled < 0;
  const absScaled = Math.abs(scaled);

  const intPart = Math.floor(absScaled / factor);
  const fracPart = absScaled % factor;

  let intStr = String(intPart);
  if (division) {
    intStr = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  let result = intStr;
  if (afterDot > 0 && fracPart !== 0) {
    const fracStr = String(fracPart).padStart(afterDot, '0').replace(/0+$/, '');
    result = `${intStr}${dot ?? '.'}${fracStr}`;
  }

  return negative ? `-${result}` : result;
};
