import React, { Component } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';

import { state as sdkConfigState, AddedSdkConfig } from '../state/SdkConfigState';
import { goUpUrl } from '../util/goUpUrl';
import { SdkConfigModal } from './basic/SdkConfigModal';

/**
 * A modal window that allows the user to add an SDK configuration to the dashboard.
 * Currently only supports specifying a target, version and options as a valid JSON.
 */
export class AddSdkConfigModal extends Component<
  RouteComponentProps<{ specId: string; sdkConfigId?: string }>,
  {}
> {
  /**
   * Whether or not a progress indicator should be shown
   */
  @observable
  private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to add SDK configuration' modal is open
   */
  @observable
  private showErrorModal: boolean = false;

  private closeModal = () => {
    if (this.props.match.params.sdkConfigId) {
      // If editing, we need to go up 3 times
      this.props.history.push(goUpUrl(this.props.match.url, 3));
    } else {
      // Otherwise, go up 2 times.
      this.props.history.push(goUpUrl(this.props.match.url, 2));
    }
  };

  @action
  private closeErrorModal = () => {
    this.showErrorModal = false;
  };

  /**
   * Event fired when the user presses the 'Add' or 'Update' button.
   */
  @action
  private onSubmitSdkConfig = async (submittedSdkConfig: AddedSdkConfig) => {
    this.showProgressIndicator = true;
    try {
      if (this.props.match.params.sdkConfigId) {
        await sdkConfigState.updateSdkConfig(
          parseInt(this.props.match.params.sdkConfigId, 10),
          submittedSdkConfig,
        );
      } else {
        await sdkConfigState.addSdkConfig({
          ...submittedSdkConfig,
          specId: parseInt(this.props.match.params.specId, 10),
        });
      }
      this.closeModal();
    } catch (e) {
      console.error(e);
      this.showErrorModal = true;
    } finally {
      this.showProgressIndicator = false;
    }
  };

  public render() {
    const {
      match: {
        params: { sdkConfigId },
      },
    } = this.props;
    return (
      <Observer>
        {() => (
          <>
            <SdkConfigModal
              submitButtonProps={{
                children: sdkConfigId ? 'Update' : 'Add',
              }}
              initialSdkConfig={
                sdkConfigId
                  ? sdkConfigState.sdkConfigs.get(parseInt(sdkConfigId, 10))
                  : undefined
              }
              titleProps={{
                children: sdkConfigId
                  ? 'Update SDK Configuration'
                  : 'Add SDK Configuration',
              }}
              onSubmitSdkConfig={this.onSubmitSdkConfig}
              onCloseModal={this.closeModal}
              showSubmitProgress={this.showProgressIndicator}
            />
            <Dialog
              open={this.showErrorModal}
              onClose={this.closeErrorModal}
              maxWidth="xs"
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  An error occurred {sdkConfigId ? 'updating' : 'adding'} the SDK
                  configuration.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button color="primary" onClick={this.closeErrorModal}>
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Observer>
    );
  }
}
