import { readKrotTxtFile } from './read-krot-txt-file';
import Grid2D from '@/shared/grid2d';
import {
  createDataSliceStore,
  dataSliceStores,
} from '@/stores/data-slice-stores';
import { toast } from 'sonner';
import { readGemFile } from './read-gem-file';
import useFileRegistryStore from '@/stores/file-registry-store';
import { readGeoFile } from './read-geo-file';
import i18n from '@/i18n';
import { logTransform } from '@/shared/log-transform';
import { BScanMode } from '@/stores/ui-store';
import useUiStore from '@/stores/ui-store';
import { FileFormatError } from './file-format-error';

type FileExtension = 'txt' | 'geo' | 'gem';

const SUPPORTED_EXTENSIONS: readonly FileExtension[] = ['txt', 'geo', 'gem'];

const LARGE_FILE_BYTES = 5 * 1024 * 1024;

export const getFileExtension = (name: string): FileExtension | undefined => {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return undefined;
  const extension = name.slice(dot + 1).toLowerCase();
  return SUPPORTED_EXTENSIONS.find((e) => e === extension);
};

const parseFile = async (
  file: File,
  extension: FileExtension,
): Promise<number[][]> => {
  switch (extension) {
    case 'txt':
      return readKrotTxtFile(await file.text());
    case 'geo':
      return readGeoFile(new Uint8Array(await file.arrayBuffer()));
    case 'gem':
      return readGemFile(new Uint8Array(await file.arrayBuffer()));
  }
};

const showLoadError = (fileName: string, error: unknown) => {
  const reason =
    error instanceof FileFormatError
      ? i18n.t(error.key)
      : error instanceof Error
        ? error.message
        : String(error);
  toast.error(`${i18n.t('FailedToReadFile')} ${fileName}: ${reason}`, {
    position: 'bottom-center',
  });
};

export const loadDataFile = async (file: File): Promise<string | undefined> => {
  try {
    const extension = getFileExtension(file.name);
    if (!extension) {
      throw new FileFormatError('UnsupportedFileType');
    }
    if (file.size > LARGE_FILE_BYTES) {
      toast.warning(i18n.t('LargeFileWarning'), { position: 'bottom-center' });
    }

    const data = await parseFile(file, extension);
    if (data.length === 0 || !data[0] || data[0].length === 0) {
      throw new FileFormatError('FileHasNoTraces');
    }

    const bScan = Grid2D.fromArray(data);
    const id = crypto.randomUUID();
    useUiStore.getState().setBScanMode(BScanMode.none);
    dataSliceStores.set(
      id,
      createDataSliceStore(id, {
        name: file.name,
        path: file.name,
        type: extension,
        bScanInitial: bScan,
        bScan: bScan.clone(),
        displayBuffer: Grid2D.fromArray(logTransform(data)),
        relief: [
          [0, 0],
          [bScan.cols - 1, 0],
        ],
      }),
    );
    useFileRegistryStore.getState().addFile(id);
    return id;
  } catch (error) {
    showLoadError(file.name, error);
    return undefined;
  }
};
