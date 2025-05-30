/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { openStructureLibrary } from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  copyAndPaste,
  cutAndPaste,
  openFileAndAddToCanvasAsNewProject,
  pressButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { scrollSettingBar } from '@utils/scrollSettingBar';

async function templateFromLAminoAcidsCategory(page: Page) {
  await openStructureLibrary(page);
  await page.getByRole('button', { name: 'L-Amino Acids (20)' }).click();
  await scrollSettingBar(page, 80);
  await page.getByText('ARG-L-Arginine').click();
  await clickInTheMiddleOfTheScreen(page);
}

async function applyIgnoreChiralFlag(page: Page) {
  await TopRightToolbar(page).Settings();

  const resetSettingsButton = page
    .getByTitle('Reset')
    .filter({ has: page.locator(':visible') });

  if (await resetSettingsButton.isEnabled()) {
    await resetSettingsButton.click();
  }
  await page.getByText('Stereochemistry', { exact: true }).click();
  await scrollSettingBar(page, 80);
  await page
    .locator('label')
    .filter({ hasText: 'Ignore the chiral flag' })
    .locator('div >> span, span')
    .first()
    .click();
  await pressButton(page, 'Apply');
}

test.describe('Ignore Chiral Flag', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Copy/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16920
    const pointX = 204;
    const pointY = 211;
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, pointX, pointY);
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Cut/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16921
    const pointY = 204;
    const pointZ = 211;
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, pointY, pointZ);
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Undo', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16919
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" flag and stereocenters', async ({
    page,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/6161
    await applyIgnoreChiralFlag(page);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/non-proprietary-structure.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" flag and stereocenters2', async ({
    page,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/6161
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V2000/non-proprietary-structure.mol',
      page,
    );
    await takeEditorScreenshot(page);
    await applyIgnoreChiralFlag(page);
    await takeEditorScreenshot(page);
  });
});
