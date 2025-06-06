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

import { useEffect, useState } from 'react';
import { RnaEditorCollapsed } from './RnaEditorCollapsed';
import { RnaEditorExpanded } from './RnaEditorExpanded';
import { ExpandIcon, RnaEditorContainer, StyledHeader } from './styles';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  createNewPreset,
  recalculateRnaBuilderValidations,
  RnaBuilderPresetsItem,
  selectActivePreset,
  selectIsEditMode,
  selectPresetFullName,
  setActiveRnaBuilderItem,
  setIsEditMode,
} from 'state/rna-builder';
import { scrollToElement } from 'helpers/dom';
import { selectIsSequenceEditInRNABuilderMode } from 'state/common';
import clsx from 'clsx';

export const scrollToSelectedPreset = (presetName) => {
  scrollToElement(`[data-rna-preset-item-name="${presetName}"]`);
};

export const scrollToSelectedMonomer = (monomerId) => {
  scrollToElement(`[data-monomer-item-id="${monomerId}"]`);
};

export const RnaEditor = ({ duplicatePreset }) => {
  const activePreset = useAppSelector(selectActivePreset);
  const isEditMode = useAppSelector(selectIsEditMode);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const activePresetFullName = selectPresetFullName(activePreset);

  const dispatch = useAppDispatch();

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (activePreset) {
      if (activePreset.name || isEditMode) setExpanded(true);
      return;
    }

    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
  }, [activePreset]);

  useEffect(() => {
    dispatch(
      recalculateRnaBuilderValidations({ rnaPreset: activePreset, isEditMode }),
    );
  }, [isEditMode]);

  const expandEditor = () => {
    setExpanded(!expanded);
    if (!activePreset?.nameInList) {
      dispatch(setIsEditMode(true));
    }
  };

  return (
    <RnaEditorContainer data-testid="rna-editor">
      <StyledHeader
        className={clsx(
          isSequenceEditInRNABuilderMode && 'styled-header--sequence-edit-mode',
          expanded && 'styled-header--expanded',
          activePreset?.name && 'styled-header--active-preset',
        )}
        onClick={expandEditor}
        data-testid="rna-builder-expand-button"
      >
        RNA Builder
        <ExpandIcon expanded={expanded} name="chevron" />
      </StyledHeader>
      {activePreset &&
        (expanded ? (
          <RnaEditorExpanded
            isEditMode={isEditMode}
            onDuplicate={duplicatePreset}
          />
        ) : (
          <RnaEditorCollapsed
            name={activePreset.name}
            fullName={activePresetFullName}
          />
        ))}
    </RnaEditorContainer>
  );
};
