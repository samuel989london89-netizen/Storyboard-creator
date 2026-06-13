import { toPng, toSvg } from 'html-to-image';

export async function exportAsPng(element: HTMLElement, filename: string): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.png`;
    a.click();
  } catch (err) {
    console.error('PNG export failed', err);
    throw err;
  }
}

export async function exportAsSvg(element: HTMLElement, filename: string): Promise<void> {
  try {
    const dataUrl = await toSvg(element, {
      backgroundColor: '#ffffff',
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.svg`;
    a.click();
  } catch (err) {
    console.error('SVG export failed', err);
    throw err;
  }
}
