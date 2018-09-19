import React, { Component } from 'react';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepButton,
} from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import { DialogTitleProps } from '@material-ui/core/DialogTitle';
import { observable, action, computed } from 'mobx';
import { Observer } from 'mobx-react';
import { isWebUri } from 'valid-url';

import { SDK_CONFIG_TARGETS, SdkConfig } from '@openapi-platform/model';
import { AddedSdkConfig } from '../../state/SdkConfigState';
import { Category } from '../../Storybook';
import {
  ValidatedFormStore,
  inputValid,
  inputInvalid,
  alwaysValid,
} from '../../ValidatedFormStore';
import { createStyled } from '../createStyled';
import { SdkConfigBasicInfoForm } from './SdkConfigBasicInfoForm';
import { SdkConfigGitInfoForm } from './SdkConfigGitInfoForm';

const Styled: any = createStyled(theme => ({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  progressIndicator: {
    margin: `0 ${theme.spacing.unit * 4}px`,
  },
}));

export type OnCloseModal = () => void;
export type OnSubmitSdkConfig = (sdkConfig: AddedSdkConfig) => void;
export interface SdkConfigModalProps {
  readonly initialSdkConfig?: SdkConfig;
  readonly titleProps?: DialogTitleProps;
  readonly onCloseModal: OnCloseModal;
  readonly onSubmitSdkConfig: OnSubmitSdkConfig;
  readonly showSubmitProgress?: boolean;
  readonly dialogProps?: DialogProps;
}

/**
 * A modal window that allows the user to add an SDK configuration to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class SdkConfigModal extends Component<SdkConfigModalProps> {
  /**
   * An array of all steps in the form, defining their name and content.
   */
  @observable
  private steps = [
    {
      name: 'Basic Information',
      inputStore: new ValidatedFormStore({
        target: {
          validation: target =>
            !SDK_CONFIG_TARGETS.includes(target)
              ? inputInvalid('Error: Missing target')
              : inputValid(),
          initialValue: this.props.initialSdkConfig
            ? this.props.initialSdkConfig.target
            : '',
        },
        version: {
          validation: alwaysValid,
          initialValue:
            this.props.initialSdkConfig && this.props.initialSdkConfig.version
              ? this.props.initialSdkConfig.version
              : '',
        },
        options: {
          validation: options => {
            try {
              JSON.parse(options);
              return inputValid();
            } catch (e) {
              return inputInvalid('Error: invalid JSON');
            }
          },
          initialValue:
            this.props.initialSdkConfig && this.props.initialSdkConfig.options
              ? JSON.stringify(this.props.initialSdkConfig.options, null, 2)
              : '{}',
        },
      }),
      render() {
        return <SdkConfigBasicInfoForm inputStore={this.inputStore} />;
      },
      complete: false,
      goToStep: () => this.goToStep(0),
    },
    {
      name: 'Git Repository',
      inputStore: new ValidatedFormStore({
        repoUrl: {
          validation: repoUrl => {
            if (!repoUrl) {
              return inputInvalid('Error: URL cannot be empty');
            } else if (!isWebUri(repoUrl)) {
              return inputInvalid('Error: Invalid URL');
            }
            return inputValid();
          },
          initialValue:
            this.props.initialSdkConfig && this.props.initialSdkConfig.gitInfo
              ? this.props.initialSdkConfig.gitInfo.repoUrl
              : '',
        },
        repoBranch: {
          validation: alwaysValid,
          initialValue:
            this.props.initialSdkConfig &&
            this.props.initialSdkConfig.gitInfo &&
            this.props.initialSdkConfig.gitInfo.branch
              ? this.props.initialSdkConfig.gitInfo.branch
              : '',
        },
        username: {
          validation: username =>
            !username ? inputInvalid('Error: Missing username') : inputValid(),
          initialValue:
            this.props.initialSdkConfig &&
            this.props.initialSdkConfig.gitInfo &&
            this.props.initialSdkConfig.gitInfo.auth.username
              ? this.props.initialSdkConfig.gitInfo.auth.username
              : '',
        },
        accessToken: {
          validation: accessToken =>
            !accessToken
              ? inputInvalid('Error: Missing personal access token')
              : inputValid(),
          initialValue:
            this.props.initialSdkConfig &&
            this.props.initialSdkConfig.gitInfo &&
            this.props.initialSdkConfig.gitInfo.auth.token
              ? this.props.initialSdkConfig.gitInfo.auth.token
              : '',
        },
      }),
      render() {
        return <SdkConfigGitInfoForm inputStore={this.inputStore} />;
      },
      complete: false,
      goToStep: () => this.goToStep(1),
    },
    {
      name: 'File Cleanup',
      inputStore: new ValidatedFormStore({}),
      render: () => <div>TODO</div>,
      complete: false,
      goToStep: () => this.goToStep(2),
    },
    {
      name: 'Readme Cleanup',
      inputStore: new ValidatedFormStore({}),
      render: () => <div>TODO</div>,
      complete: false,
      goToStep: () => this.goToStep(3),
    },
  ];

  /**
   * The current selected step in the form.
   */
  @observable
  private currentStep: number = 0;

  /**
   * True if all steps but the last step have been completed, false otherwise.
   */
  @computed
  private get allStepsCompleted(): boolean {
    return this.steps.slice(0, -1).every(step => step.complete);
  }

  /**
   * Goes to the given step in the form.
   */
  @action
  private goToStep(step: number) {
    // Validate input
    if (this.steps[this.currentStep].inputStore.inputsValid) {
      this.steps[this.currentStep].complete = true;
    }
    this.steps[step].complete = false;
    this.currentStep = step;
  }

  /**
   * Goes to the next step in the form.
   */
  private goToNextStep = () => {
    // Validate input
    if (!this.steps[this.currentStep].inputStore.inputsValid) {
      this.steps[this.currentStep].inputStore.updateAllInputErrors();
      return;
    }
    if (this.currentStep < this.steps.length - 1) {
      this.goToStep(this.currentStep + 1);
    } else {
      this.steps[this.currentStep].complete = true;
      this.onSubmitSdkConfig();
    }
  };

  /**
   * Goes to the previous step in the form.
   */
  private goToPreviousStep = () => {
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  };

  /**
   * Event fired when the user presses the 'Add' button.
   */
  private onSubmitSdkConfig() {
    // Validate input
    if (!this.allStepsCompleted || !this.steps[this.steps.length - 1].complete) {
      return;
    }

    // Send the request to the backend
    const basicInfoInputStore = this.steps[0].inputStore as ValidatedFormStore<
      'target' | 'version' | 'options'
    >;
    const target = basicInfoInputStore.getInputValue('target');
    const version = basicInfoInputStore.getInputValue('version');
    const options = JSON.parse(basicInfoInputStore.getInputValue('options'));
    // TODO: submittedSdkConfig.pushPath = "";
    this.props.onSubmitSdkConfig({ target, version, options });
  }

  public render() {
    const { onCloseModal, titleProps, dialogProps, showSubmitProgress } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <Dialog open onClose={onCloseModal} maxWidth="md" {...dialogProps}>
                <form>
                  <DialogTitle {...titleProps} />
                  <DialogContent classes={{ root: classes.modalContent }}>
                    <Stepper nonLinear activeStep={this.currentStep}>
                      {this.steps.map((step, index) => (
                        <Step key={index}>
                          <StepButton onClick={step.goToStep} completed={step.complete}>
                            {step.name}
                          </StepButton>
                        </Step>
                      ))}
                    </Stepper>
                    {this.steps[this.currentStep].render()}
                  </DialogContent>
                  <DialogActions>
                    {this.currentStep === 0 ? (
                      <Button color="primary" onClick={onCloseModal}>
                        Cancel
                      </Button>
                    ) : (
                      <Button color="primary" onClick={this.goToPreviousStep}>
                        Back
                      </Button>
                    )}
                    {showSubmitProgress ? (
                      <CircularProgress size={24} className={classes.progressIndicator} />
                    ) : (
                      <Button
                        color="primary"
                        onClick={this.goToNextStep}
                        disabled={
                          this.currentStep === this.steps.length - 1 &&
                          !this.allStepsCompleted
                        }
                      >
                        {this.currentStep === this.steps.length - 1 ? 'Done' : 'Next'}
                      </Button>
                    )}
                  </DialogActions>
                </form>
              </Dialog>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}

export const storybook: Category<SdkConfigModalProps> = {
  Component: SdkConfigModal,
  stories: {
    Submit: {
      onCloseModal: () => {},
      onSubmitSdkConfig: () => {},
      showSubmitProgress: false,
    },
  },
};
