/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { ElementWithDropdown } from './ElementWithDropdown';
import { TopToolbarIconButton } from './TopToolbarIconButton';

interface ClipboardControlsProps {
  onCopy: () => void;
  onCopyMol: () => void;
  onCopyKet: () => void;
  onCopyImage: () => void;
  onPaste: () => void;
  onCut: () => void;
  disabledButtons: string[];
  hiddenButtons: string[];
  shortcuts: { [key in string]: string };
}

export const ClipboardControls = ({
  onCopy,
  onCopyMol,
  onCopyKet,
  onCopyImage,
  onPaste,
  onCut,
  shortcuts,
  disabledButtons,
  hiddenButtons,
}: ClipboardControlsProps) => {
  const copyButtons = [
    {
      name: 'copy',
      title: 'Copy',
      handler: onCopy,
      testId: 'copy-button',
    },
    {
      name: 'copy-mol',
      title: 'Copy as MOL',
      handler: onCopyMol,
      testId: 'copy-mol-button',
    },
    {
      name: 'copy-ket',
      title: 'Copy as KET',
      handler: onCopyKet,
      testId: 'copy-ket-button',
    },
    {
      name: 'copy-image',
      title: 'Copy Image',
      handler: onCopyImage,
      testId: 'copy-image-button',
    },
  ];

  const getButtonElement = (button) => (
    <TopToolbarIconButton
      title={button.title}
      onClick={button.handler}
      iconName={button.name}
      shortcut={shortcuts[button.name]}
      disabled={disabledButtons.includes(button.name)}
      isHidden={hiddenButtons.includes(button.name)}
      key={button.name}
      testId={button.testId}
    />
  );

  const firstButtonObj = copyButtons.find(
    (button) => !hiddenButtons.includes(button.name),
  );
  const collapsibleElements = copyButtons
    .filter((button) => button !== firstButtonObj)
    .map((button) => getButtonElement(button));

  return (
    <>
      {!hiddenButtons.includes('copies') && (
        <ElementWithDropdown
          topElement={getButtonElement(firstButtonObj)}
          dropDownElements={collapsibleElements}
        />
      )}
      <TopToolbarIconButton
        title="Paste"
        testId="paste-button"
        onClick={onPaste}
        iconName="paste"
        shortcut={shortcuts.paste}
        disabled={disabledButtons.includes('paste')}
        isHidden={hiddenButtons.includes('paste')}
      />
      <TopToolbarIconButton
        title="Cut"
        testId="cut-button"
        onClick={onCut}
        iconName="cut"
        shortcut={shortcuts.cut}
        disabled={disabledButtons.includes('cut')}
        isHidden={hiddenButtons.includes('cut')}
      />
    </>
  );
};
