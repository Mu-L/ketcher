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

import { BaseCallProps, BaseProps } from '../../../modal.types';
import Form, { Field } from '../../../../../component/form/form/form';
import {
  setDefaultSettings,
  updateFormState,
} from '../../../../../state/modal/form';
import { useEffect, useState } from 'react';

import ColorPicker from '../../../../../component/form/colorPicker/ColorPicker';
import { Dialog } from '../../../../components';
import MeasureInput from '../../../../../component/form/MeasureInput/measure-input';
import OpenButton from '../../../../../component/view/openbutton';
import { SaveButton } from '../../../../../component/view/savebutton';
import Select from '../../../../../component/form/Select';
import Accordion from './Accordion';
import { KetcherLogger, StructService } from 'ketcher-core';
import SystemFonts from '../../../../../component/form/systemfonts';
import classes from './Settings.module.less';
import { connect } from 'react-redux';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { saveSettings } from '../../../../../state/options';
import settingsSchema, {
  getDefaultOptions,
} from '../../../../../data/schema/options-schema';
import fieldGroups from './fieldGroups';
import { isEqual } from 'lodash';
import { Icon } from 'components';
import { ACS_STYLE_DEFAULT_SETTINGS } from 'src/constants';
import { onAction } from 'src/script/ui/state/shared';

interface SettingsProps extends BaseProps {
  initState: any;
  appOpts: {
    version: string;
    buildDate: string;
    buildNumber: string;
    indigoVersion: string;
    imagoVersions: Array<string>;
    server: boolean;
    templates: boolean;
  };
  server: StructService;
}

interface SettingsCallProps extends BaseCallProps {
  onOpenFile: (any) => void;
  onReset: () => void;
  onACSStyle: (result) => void;
}

const defaultSettings = getDefaultOptions();

const HeaderContent = ({
  server,
  onOpenFile,
  onReset,
  formState,
  initState,
}) => {
  const getIsResetDisabled = () => {
    if (formState.result.init) return isEqual(defaultSettings, initState);
    else return isEqual(defaultSettings, formState.result);
  };

  return (
    <div className={classes.headerContent}>
      <span className={classes.title}> Settings</span>
      <OpenButton
        title="Open from File"
        key="settings"
        server={server}
        onLoad={onOpenFile}
        className={classes.button}
        data-testid="open-settings-from-file-button"
      >
        <Icon name="open-1" />
      </OpenButton>
      <SaveButton
        title="Save to File"
        key="ketcher-settings"
        data={JSON.stringify(formState.result)}
        filename="ketcher-settings"
        className={classes.button}
        data-testid="save-settings-to-file-button"
      >
        <Icon name="save-1" />
      </SaveButton>
      <button
        title="Reset"
        key="settings-button"
        onClick={onReset}
        className={classes.button}
        data-testid="reset-settings-button"
        disabled={getIsResetDisabled()}
      >
        <Icon name="reset" />
      </button>
    </div>
  );
};

type Props = SettingsProps & SettingsCallProps;

const settingsProps = settingsSchema.properties;

const SettingsDialog = (props: Props) => {
  const {
    initState,
    formState,
    server,
    onOpenFile,
    onReset,
    appOpts,
    ...prop
  } = props;

  const [changedGroups, setChangedGroups] = useState(new Set());

  useEffect(() => {
    const changed = new Set<string>();

    for (const key in initState) {
      if (initState[key] !== formState.result[key]) {
        const group = fieldGroups[key];
        changed.add(group);
      }
    }
    setChangedGroups(changed);
  }, [initState, formState.result]);

  const generalTab = {
    key: 'general',
    label: 'General',
    content: (
      <fieldset>
        <Field
          name="resetToSelect"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.resetToSelect)}
          data-testid="reset-to-select"
        />
        <Field name="rotationStep" data-testid="rotation-step" />
        <Field name="showValenceWarnings" data-testid="show-valence-warnings" />
        <Field name="atomColoring" data-testid="atom-coloring" />
        <Field
          name="font"
          component={SystemFonts}
          data-testid="font-selection"
        />
        <Field
          name="fontsz"
          component={MeasureInput}
          labelPos={false}
          extraName="fontszUnit"
        />
        <Field
          name="fontszsub"
          component={MeasureInput}
          labelPos={false}
          extraName="fontszsubUnit"
        />
        <Field
          name="reactionComponentMarginSize"
          component={MeasureInput}
          labelPos={false}
          extraName="reactionComponentMarginSizeUnit"
        />
        <Field
          name="imageResolution"
          tooltip="option applicable to PNG/SVG pictures renderer"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.imageResolution)}
          data-testid="image-resolution"
        />
      </fieldset>
    ),
  };
  const stereoTab = {
    key: 'stereo',
    label: 'Stereochemistry',
    content: (
      <fieldset>
        <Field name="showStereoFlags" data-testid="show-stereo-flags" />
        <Field
          name="stereoLabelStyle"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.stereoLabelStyle)}
          data-testid="stereo-label-style"
        />
        <Field
          name="colorOfAbsoluteCenters"
          component={ColorPicker}
          data-testid="color-of-absolute-centers"
        />
        <Field
          name="colorOfAndCenters"
          component={ColorPicker}
          data-testid="color-of-and-centers"
        />
        <Field
          name="colorOfOrCenters"
          component={ColorPicker}
          data-testid="color-of-or-centers"
        />
        <Field
          name="colorStereogenicCenters"
          component={Select}
          options={getSelectOptionsFromSchema(
            settingsProps?.colorStereogenicCenters,
          )}
          data-testid="color-stereogenic-centers"
        />
        <Field
          name="autoFadeOfStereoLabels"
          data-testid="auto-fade-of-stereo-labels"
        />
        <Field name="absFlagLabel" data-testid="abs-flag-label" />
        <Field name="andFlagLabel" data-testid="and-flag-label" />
        <Field name="orFlagLabel" data-testid="or-flag-label" />
        <Field name="mixedFlagLabel" data-testid="mixed-flag-label" />
        <Field
          name="ignoreChiralFlag"
          tooltip="Ignore chiral flag while loading from molfiles. By default all the stereo will be ABS"
          data-testid="ignore-chiral-flag"
        />
      </fieldset>
    ),
  };
  const atomsTab = {
    key: 'atoms',
    label: 'Atoms',
    content: (
      <fieldset>
        <Field name="carbonExplicitly" data-testid="carbon-explicitly" />
        <Field name="showCharge" data-testid="show-charge" />
        <Field name="showValence" data-testid="show-valence" />
        <Field
          name="showHydrogenLabels"
          component={Select}
          options={getSelectOptionsFromSchema(
            settingsProps?.showHydrogenLabels,
          )}
          data-testid="show-hydrogen-labels"
        />
      </fieldset>
    ),
  };
  const bondsTab = {
    key: 'bonds',
    label: 'Bonds',
    content: (
      <fieldset>
        <Field name="aromaticCircle" data-testid="aromatic-circle" />
        <Field
          name="bondLength"
          component={MeasureInput}
          labelPos={false}
          extraName="bondLengthUnit"
        />
        <Field name="bondSpacing" extraLabel="% of length" />
        <Field
          name="bondThickness"
          component={MeasureInput}
          labelPos={false}
          extraName="bondThicknessUnit"
        />
        <Field
          name="stereoBondWidth"
          component={MeasureInput}
          labelPos={false}
          extraName="stereoBondWidthUnit"
        />
        <Field
          name="hashSpacing"
          component={MeasureInput}
          labelPos={false}
          extraName="hashSpacingUnit"
        />
      </fieldset>
    ),
  };
  const serverTab = {
    key: 'server',
    label: 'Server',
    content: (
      <fieldset disabled={!appOpts.server}>
        <Field name="smart-layout" data-testid="smart-layout" />
        <Field
          name="ignore-stereochemistry-errors"
          data-testid="ignore-stereochemistry-errors"
        />
        <Field
          name="mass-skip-error-on-pseudoatoms"
          data-testid="mass-skip-error-on-pseudoatoms"
        />
        <Field
          name="gross-formula-add-rsites"
          data-testid="gross-formula-add-rsites"
        />
        <Field
          name="gross-formula-add-isotopes"
          data-testid="gross-formula-add-isotopes"
        />
      </fieldset>
    ),
  };
  const threeDViewerTab = {
    key: '3dviewer',
    label: '3D Viewer',
    content: (
      // eslint-disable-next-line dot-notation
      <fieldset className={classes.viewer}>
        <Field
          name="miewMode"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.miewMode)}
          data-testid="display-mode"
        />
        <Field
          name="miewTheme"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.miewTheme)}
          data-testid="background-color"
        />
        <Field
          name="miewAtomLabel"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.miewAtomLabel)}
          data-testid="label-coloring"
        />
      </fieldset>
    ),
  };
  const debuggingTab = {
    key: 'debugging',
    label: 'Options for Debugging',
    content: (
      <fieldset>
        <Field name="showAtomIds" data-testid="show-atom-ids" />
        <Field name="showBondIds" data-testid="show-bond-ids" />
        <Field name="showHalfBondIds" data-testid="show-half-bond-ids" />
        <Field name="showLoopIds" data-testid="show-loop-ids" />
      </fieldset>
    ),
  };

  const onACSStyle = () => {
    prop.onACSStyle({
      ...formState.result,
      ...ACS_STYLE_DEFAULT_SETTINGS,
    });
  };

  const ACSStyleButton = (
    <button
      className={classes.acsStyleButton}
      key="acsstylebutton"
      onClick={onACSStyle}
      data-testid="acs-style-button"
    >
      Set ACS Settings
    </button>
  );

  const tabs = [
    generalTab,
    stereoTab,
    atomsTab,
    bondsTab,
    serverTab,
    threeDViewerTab,
    debuggingTab,
  ];

  return (
    <Dialog
      className={classes.settings}
      result={() => [formState.result, initState]}
      valid={() => formState.valid}
      params={prop}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={[ACSStyleButton, 'Cancel', 'OK']}
      withDivider
      needMargin={false}
      headerContent={
        <HeaderContent
          server={server}
          onOpenFile={onOpenFile}
          onReset={onReset}
          formState={formState}
          initState={initState}
        />
      }
    >
      <Form schema={settingsSchema} init={initState} {...formState}>
        <Accordion
          tabs={tabs}
          className={classes.accordion}
          changedGroups={changedGroups}
        />
      </Form>
    </Dialog>
  );
};

const mapStateToProps = (state) => ({
  server: state.options.app.server ? state.server : null,
  appOpts: state.options.app,
  initState: state.options.settings,
  formState: state.modal.form,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenFile: (newOpts) => {
    try {
      dispatch(updateFormState({ result: JSON.parse(newOpts) }));
    } catch (e) {
      KetcherLogger.error('Settings.tsx::mapDispatchToProps', e);
      console.info('Bad file');
    }
  },
  onReset: () => dispatch(setDefaultSettings()),
  onOk: (res) => {
    const [result, initState] = res;

    dispatch(saveSettings(result));
    ownProps.onOk(result);

    const showNotification =
      initState.reactionComponentMarginSize !==
      result.reactionComponentMarginSize;

    showNotification &&
      dispatch(
        onAction({
          dialog: 'info-modal',
          prop: {
            title: '',
            customText:
              'To fully apply these changes, you need to apply the layout.',
            button: 'OK',
          },
        }),
      );
  },
  onACSStyle: (result) => {
    dispatch(updateFormState({ result }));
  },
});

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsDialog);

export default Settings;
