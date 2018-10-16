import { observer } from 'mobx-react';
import React, { SFC } from 'react';
import { Route, RouteComponentProps } from 'react-router';

import { Spec, SdkConfig, HasId } from '@openapi-platform/model';
import { state as sdkConfigState } from '../state/SdkConfigState';
import { state as specState } from '../state/SpecState';
import { AddSdkConfigModal } from './AddSdkConfigModal';
import { AddSpecModal } from './AddSpecModal';
import { NotFound } from './basic/NotFound';
import { SpecInformation } from './basic/SpecInformation';
import { DeleteSpecModal } from './DeleteSpecModal';

export const SpecViewer: SFC<RouteComponentProps<{}>> = observer(({ history, match }) => {
  const specId = Number.parseInt(match.params.id, 10);
  const specification = specState.specs.get(specId);
  const sdkConfigs = sdkConfigState.specSdkConfigs.get(specId);

  const onNavigateBack = () => history.push(match.url.replace('specs', 'overview'));

  const onEditSdkConfigModal = (sdkConfig: HasId<SdkConfig>) =>
    history.push(`${match.url}/sdk-configs/${sdkConfig.id}/edit`);
  const openEditSpecModal = (spec: HasId<Spec>) => history.push(`${match.url}/edit`);
  const openDeleteSpecModal = (spec: HasId<Spec>) => history.push(`${match.url}/delete`);
  const openAddSdkConfigModal = (spec: HasId<Spec>) =>
    history.push(`${match.url}/sdk-configs/add`);

  return specification ? (
    <>
      <SpecInformation
        spec={specification}
        sdkConfigs={sdkConfigs}
        onEditSdkConfig={onEditSdkConfigModal}
        onNavigateBack={onNavigateBack}
        // Open a modal to edit the current spec
        onEditSpec={openEditSpecModal}
        // Open a model to delete the current spec
        onDeleteSpec={openDeleteSpecModal}
        // Open a modal to add an SDK configuration when the 'Add SDK Configuration' button is
        // clicked
        onAddSdkConfig={openAddSdkConfigModal}
      />
      <Route exact path={`${match.path}/edit`} component={AddSpecModal} />
      <Route exact path={`${match.path}/delete`} component={DeleteSpecModal} />
      <Route exact path={`${match.path}/sdk-configs/add`} component={AddSdkConfigModal} />
      <Route
        exact
        path={`${match.path}/sdk-configs/:sdkConfigId/edit`}
        component={AddSdkConfigModal}
      />
    </>
  ) : (
    <NotFound item="specification" />
  );
});
