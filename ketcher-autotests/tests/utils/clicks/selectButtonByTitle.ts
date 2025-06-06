import { Page } from '@playwright/test';
import { getLeftToolBarWidth, getTopToolBarHeight } from '..';

export async function getRotationHandleCoordinates(page: Page) {
  const leftBarWidth = await getLeftToolBarWidth(page);
  const topBarHeight = await getTopToolBarHeight(page);
  const handleCenter = await page.evaluate(() => {
    const handle = window.ketcher.editor.rotateController.handleCenter;
    const { zoom } = window.ketcher.editor.options();
    return {
      x: handle.x * zoom,
      y: handle.y * zoom,
    };
  });
  return {
    x: handleCenter.x + leftBarWidth,
    y: handleCenter.y + topBarHeight,
  };
}
