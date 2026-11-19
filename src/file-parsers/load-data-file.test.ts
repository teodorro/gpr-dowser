// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { dataSliceStores } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { getFileExtension, loadDataFile } from './load-data-file';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), warning: vi.fn() },
}));

const GEM_HEADER = 514;
const GEM_TRACE = 512 + 112;

const makeGem = (traces: number, value: number): Uint8Array => {
  const raw = new Uint8Array(GEM_HEADER + traces * GEM_TRACE);
  raw[16] = (traces >> 8) & 0xff;
  raw[17] = traces & 0xff;
  for (let i = 0; i < traces; i++) {
    raw.fill(
      value,
      GEM_HEADER + i * GEM_TRACE,
      GEM_HEADER + i * GEM_TRACE + 512,
    );
  }
  return raw;
};

const fileOf = (bytes: Uint8Array | string, name: string) =>
  new File([bytes as BlobPart], name);

const lastErrorMessage = () =>
  String(vi.mocked(toast.error).mock.calls.at(-1)?.[0]);

describe('getFileExtension', () => {
  it('is case-insensitive and rejects unknown types', () => {
    expect(getFileExtension('a.GEM')).toBe('gem');
    expect(getFileExtension('a.b.Geo')).toBe('geo');
    expect(getFileExtension('a.txt')).toBe('txt');
    expect(getFileExtension('a.pdf')).toBeUndefined();
    expect(getFileExtension('noext')).toBeUndefined();
  });
});

describe('loadDataFile', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.mocked(toast.error).mockClear();
  });

  afterEach(() => {
    dataSliceStores.clear();
    useFileRegistryStore.setState({ fileIds: [], selectedFileId: undefined });
  });

  it('loads a .gem file with an upper-case extension', async () => {
    const id = await loadDataFile(fileOf(makeGem(3, 140), 'RIVER.GEM'));

    expect(id).toBeDefined();
    const state = dataSliceStores.get(id!)!.getState();
    expect(state.type).toBe('gem');
    expect(state.bScan.cols).toBe(3);
    expect(state.bScan.rows).toBe(512);
    expect(state.relief).toEqual([
      [0, 0],
      [2, 0],
    ]);
    expect(useFileRegistryStore.getState().fileIds).toEqual([id]);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('reports an unsupported file type instead of throwing', async () => {
    const id = await loadDataFile(fileOf('x', 'notes.pdf'));

    expect(id).toBeUndefined();
    expect(lastErrorMessage()).toContain('unsupported file type');
    expect(useFileRegistryStore.getState().fileIds).toEqual([]);
  });

  it('reports a .gem file that has no traces', async () => {
    const id = await loadDataFile(fileOf(makeGem(2, 0), 'empty.gem'));

    expect(id).toBeUndefined();
    expect(lastErrorMessage()).toContain('the file contains no traces');
  });

  it('reports a .geo file with an unknown layout in the UI language', async () => {
    await i18n.changeLanguage('ru');
    const id = await loadDataFile(fileOf(new Uint8Array(64), 'bad.geo'));

    expect(id).toBeUndefined();
    expect(lastErrorMessage()).toContain('неизвестная структура трасс');
  });
});
