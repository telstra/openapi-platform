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
  RouteComponentProps<{ specId: string }>,
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
    this.props.history.push('/');
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
      await sdkConfigState.addSdkConfig({
        ...submittedSdkConfig,
        specId: parseInt(this.props.match.params.specId, 10),
      });
      this.closeModal();
    } catch (e) {
      console.error(e);
      this.showErrorModal = true;
    } finally {
      this.showProgressIndicator = false;
    }
  };

  public render() {
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => [
              <SdkConfigModal
                key={0}
                submitButtonProps={{
                  children: 'Add',
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
                  <Typography>An error occurred adding the SDK configuration.</Typography>
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
