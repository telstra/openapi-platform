import React, { Component } from 'react';

import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { DialogProps } from '@material-ui/core/Dialog';
import { DialogTitleProps } from '@material-ui/core/DialogTitle';
import { Observer } from 'mobx-react';

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

const Styled: any = createStyled(theme => ({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  optionsText: {
    fontFamily: 'Roboto Mono',
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
  readonly cancelButtonProps?: ButtonProps;
  readonly submitButtonProps?: ButtonProps;
  readonly showSubmitProgress?: boolean;
  readonly dialogProps?: DialogProps;
}

/**
 * A modal window that allows the user to add an SDK configuration to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class SdkConfigModal extends Component<SdkConfigModalProps> {
  /**
   * Stores all form data and handles input validation logic.
   */
  private inputStore = new ValidatedFormStore({
    target: {
      validation: target =>
        !SDK_CONFIG_TARGETS.includes(target)
          ? inputInvalid('Error: Missing target')
          : inputValid(),
      initialValue: this.props.initialSdkConfig ? this.props.initialSdkConfig.target : '',
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
  });

  /**
   * Event fired when the user presses the 'Add' button.
   */
  private onSubmitSdkConfig() {
    // Validate input
    if (!this.inputStore.inputsValid) {
      this.inputStore.updateAllInputErrors();
      return;
    }

    // Send the request to the backend.
    const target = this.inputStore.getInputValue('target');
    const version = this.inputStore.getInputValue('version');
    const options = JSON.parse(this.inputStore.getInputValue('options'));
    // TODO: submittedSdkConfig.pushPath = "";
    this.props.onSubmitSdkConfig({ target, version, options });
  }

  private onInputChange = event =>
    this.inputStore.setInputValue(event.target.id, event.target.value);
  private onInputBlur = event => this.inputStore.updateInputError(event.target.id);
  private onTargetChange = event =>
    this.inputStore.setInputValue('target', event.target.value);
  private onTargetBlur = () => this.inputStore.updateInputError('target');

  private onAddButtonClick = event => {
    event.preventDefault();
    this.onSubmitSdkConfig();
  };

  public render() {
    const {
      onCloseModal,
      titleProps,
      dialogProps,
      cancelButtonProps,
      showSubmitProgress,
      submitButtonProps,
    } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <Dialog
                open
                onClose={onCloseModal}
                maxWidth="sm"
                fullWidth
                {...dialogProps}
              >
                <DialogTitle {...titleProps} />
                <DialogContent classes={{ root: classes.modalContent }}>
                  <FormControl
                    error={this.inputStore.getInputError('target') !== null}
                    margin="dense"
                  >
                    <InputLabel htmlFor="target">Target</InputLabel>
                    <Select
                      onChange={this.onTargetChange}
                      onBlur={this.onTargetBlur}
                      value={this.inputStore.getInputValue('target')}
                      inputProps={{
                        id: 'target',
                      }}
                    >
                      {SDK_CONFIG_TARGETS.map(target => (
                        <MenuItem key={target} value={target}>
                          {target}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {this.inputStore.getInputError('target')}
                    </FormHelperText>
                  </FormControl>
                  <FormControl
                    error={this.inputStore.getInputError('version') !== null}
                    margin="dense"
                  >
                    <InputLabel htmlFor="version">Version</InputLabel>
                    <Input
                      id="version"
                      onChange={this.onInputChange}
                      onBlur={this.onInputBlur}
                      value={this.inputStore.getInputValue('version')}
                    />
                    <FormHelperText>
                      {this.inputStore.getInputError('version') || 'E.g. 1.2.34'}
                    </FormHelperText>
                  </FormControl>
                  <FormControl
                    error={this.inputStore.getInputError('options') !== null}
                    margin="dense"
                  >
                    <InputLabel htmlFor="options">Options</InputLabel>
                    <Input
                      id="options"
                      className={classes.optionsText}
                      onChange={this.onInputChange}
                      onBlur={this.onInputBlur}
                      value={this.inputStore.getInputValue('options')}
                      multiline
                      rows={5}
                      rowsMax={10}
                    />
                    <FormHelperText>
                      {this.inputStore.getInputError('options') ||
                        'Target-specific options to pass to Swagger Codegen in JSON'}
                    </FormHelperText>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button
                    color="primary"
                    type="button"
                    onClick={onCloseModal}
                    {...cancelButtonProps}
                  >
                    Cancel
                  </Button>
                  {showSubmitProgress ? (
                    <CircularProgress size={24} className={classes.progressIndicator} />
                  ) : (
                    <Button
                      color="primary"
                      type="submit"
                      onClick={this.onAddButtonClick}
                      {...submitButtonProps}
                    />
                  )}
                </DialogActions>
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
      submitButtonProps: {
        children: 'Submit',
      },
    },
  },
};
