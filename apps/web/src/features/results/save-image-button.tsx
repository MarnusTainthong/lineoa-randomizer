import { toPng } from 'html-to-image';
import { useState, type RefObject } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { useSnackbar } from '../../components/ui/snackbar';
import { isInLineApp } from '../../lib/liff';
import { TH } from '../../lib/th';

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], fileName, { type: 'image/png' });
}

/**
 * Renders `targetRef` to a PNG. Fallback order inside the LINE in-app browser:
 * 1) Web Share API with the file, 2) <a download>, 3) a dialog to long-press the image.
 */
export function SaveImageButton({
  targetRef,
  fileName,
}: {
  targetRef: RefObject<HTMLElement>;
  fileName: string;
}) {
  const showSnackbar = useSnackbar();
  const [isBusy, setIsBusy] = useState(false);
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);

  async function saveImage() {
    if (!targetRef.current) return;
    setIsBusy(true);
    try {
      const dataUrl = await toPng(targetRef.current, { pixelRatio: 2, cacheBust: true });
      const file = await dataUrlToFile(dataUrl, fileName);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else if (!isInLineApp()) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
      } else {
        setFallbackImageUrl(dataUrl);
      }
    } catch (error) {
      // Cancelling the share sheet is not an error.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        showSnackbar(TH.common.errorTitle);
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <Button variant="tonal" icon="download" onClick={() => void saveImage()} disabled={isBusy}>
        {TH.results.saveImage}
      </Button>
      {fallbackImageUrl && (
        <Dialog title={TH.results.saveImageHint} onClose={() => setFallbackImageUrl(null)}>
          <img src={fallbackImageUrl} alt="" className="w-full rounded-xl" />
        </Dialog>
      )}
    </>
  );
}
