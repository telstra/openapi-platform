import React, { Component } from 'react';

import { Button, Typography } from '@material-ui/core';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';

import { state as sdkConfigState, AddedSdkConfig } from '../state/SdkConfigState';
import { FloatingModal } from './basic/FloatingModal';
import { SdkConfigModal } from './basic/SdkConfigModal';
import { createStyled } from './createStyled';

const Styled: any = createStyled(theme => ({
  errorModalPaper: {
    maxWidth: theme.spacing.unit * 48,
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 3,
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing.unit,
  },
}));

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
   * Whether or not the 'failed to add SdkConfig' modal is open
   */
  @observable
  private showErrorModal: boolean = false;

  private closeModal = () => {
    // TODO: This might need to get refactored.
    const lastSlash = this.props.match.url.lastIndexOf('/');
    const secondLastSlash = this.props.match.url.lastIndexOf('/', lastSlash - 1);
    if (this.props.match.params.sdkConfigId) {
      // If editing, we need to go up 3 times
      const thirdLastSlash = this.props.match.url.lastIndexOf('/', secondLastSlash - 1);
      this.props.history.push(this.props.match.url.slice(0, thirdLastSlash));
    } else {
      // Otherwise, go up 2 times.
      this.props.history.push(this.props.match.url.slice(0, secondLastSlash));
    }
  };

  private closeErrorModal = () => {
    this.showErrorModal = false;
  };

  /**
   * Event fired when the user presses the 'Add' button.
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
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => [
              <SdkConfigModal
                key={0}
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
              />,
              <FloatingModal
                key={1}
                open={this.showErrorModal}
                onClose={this.closeErrorModal}
                classes={{ paper: classes.errorModalPaper }}
              >
                <div className={classes.modalContent}>
                  <Typography variant="title">Error</Typography>
                  <Typography>
                    An error occurred {sdkConfigId ? 'updating' : 'adding'} the
                    specification.
                  </Typography>
                </div>
                <div className={classes.buttonRow}>
                  <Button color="primary" onClick={this.closeErrorModal}>
                    Ok
                  </Button>
                </div>
              </FloatingModal>,
            ]}
          </Observer>
        )}
      </Styled>
    );
  }
}
