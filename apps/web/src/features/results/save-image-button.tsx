import { toPng } from 'html-to-image';
import { useState, type RefObject } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { useSnackbar } from '../../components/ui/snackbar';
import { isInLineApp } from '../../lib/liff';
import { TH } from '../../lib/th';

const PAINT_PROPERTIES = [
  'backgroundColor',
  'backgroundImage',
  'backgroundSize',
  'backgroundRepeat',
  'backgroundPosition',
  'color',
  'fill',
  'opacity',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRadius',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'textAlign',
] as const;

/**
 * The image capture copies styles into an SVG that does not have this app's
 * CSS variables. Write the used colors and the font onto the clone first.
 */
function bakePaintStyles(source: HTMLElement, clone: HTMLElement): void {
  const sources = [source, ...source.querySelectorAll<HTMLElement>('*')];
  const clones = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
  sources.forEach((node, index) => {
    const target = clones[index];
    if (!target) return;
    const computed = getComputedStyle(node);
    for (const property of PAINT_PROPERTIES) {
      target.style[property] = computed[property];
    }
  });
}

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
      await document.fonts.ready;
      const source = targetRef.current;
      const bounds = source.getBoundingClientRect();
      const host = document.createElement('div');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = `position:fixed;left:-10000px;top:0;width:${bounds.width}px;height:${bounds.height}px;pointer-events:none;`;
      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.width = `${bounds.width}px`;
      clone.style.height = `${bounds.height}px`;
      bakePaintStyles(source, clone);
      host.appendChild(clone);
      document.body.appendChild(host);
      let dataUrl: string;
      try {
        dataUrl = await toPng(clone, { pixelRatio: 2, skipFonts: false });
      } finally {
        host.remove();
      }
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
      <Button variant="tonal" icon="download" onClick={() => void saveImage()} loading={isBusy}>
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
