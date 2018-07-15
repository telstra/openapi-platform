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
  Typography,
} from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { ModalProps } from '@material-ui/core/Modal';
import { observable, action, computed } from 'mobx';
import { Observer } from 'mobx-react';

import { FloatingModal } from 'basic/FloatingModal';
import { PLAN_TARGETS } from 'model/Plan';
import { Category } from 'model/Storybook';
import { AddedPlan } from 'state/PlanState';
import { state as specificationsState } from 'state/SpecState';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
  modalPaper: {
    maxWidth: theme.spacing.unit * 64,
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 3,
  },
  optionsText: {
    fontFamily: 'Roboto Mono',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing.unit,
  },
  progressIndicator: {
    margin: `0 ${theme.spacing.unit * 4}px`,
  },
}));

export interface FormText {
  target: string;
  version: string;
  options: string;
}

export interface FormError {
  target?: string;
  options?: string;
}

export type OnCloseModal = () => void;
export type OnSubmitPlan = (plan: AddedPlan) => void;
export interface PlanModalProps {
  readonly onCloseModal: OnCloseModal;
  readonly onSubmitPlan: OnSubmitPlan;
  readonly cancelButtonProps?: ButtonProps;
  readonly submitButtonProps?: ButtonProps;
  readonly showSubmitProgress?: boolean;
  readonly modalProps?: ModalProps;
}

/**
 * A modal window that allows the user to add a SDK generation Plan to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class PlanModal extends Component<PlanModalProps> {
  /**
   * Currently entered form data
   */
  @observable
  private readonly formText: FormText = {
    target: '',
    version: '',
    options: '{}',
  };

  /**
   * Current error messages (if any) for each form field
   */
  @observable
  private readonly error: FormError = {
    target: undefined,
    options: undefined,
  };

  /**
   * @returns An error message if the target is invalid in some way
   */
  @computed
  get targetError(): string | undefined {
    const title = this.formText.target;
    return !title ? 'Error: Missing target' : undefined;
  }

  /**
   * @returns An error message if the options are invalid in some way
   */
  @computed
  get optionsError(): string | undefined {
    const optionsStr = this.formText.options;
    try {
      JSON.parse(optionsStr);
      return undefined;
    } catch (e) {
      return 'Error: invalid JSON';
    }
  }

  /**
   * Checks whether the plan's target input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  private validateTarget(showErrorMesssage: boolean = true): boolean {
    let valid: boolean;
    if (this.targetError) {
      if (showErrorMesssage) {
        this.error.target = this.targetError;
      }
      valid = false;
    } else {
      this.error.target = undefined;
      valid = true;
    }
    return valid;
  }

  /**
   * Checks whether the plan's options input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  private validateOptions(showErrorMesssage: boolean = true): boolean {
    let valid: boolean;
    if (this.optionsError) {
      if (showErrorMesssage) {
        this.error.options = this.optionsError;
      }
      valid = false;
    } else {
      this.error.options = undefined;
      valid = true;
    }
    return valid;
  }

  /**
   * @param showErrorMessages If false, only clears validation errors rather than adding them.
   * @returns true if the input was valid, false otherwise.
   */
  @action
  private validateAllInputs(showErrorMessages: boolean = true) {
    const targetValid = this.validateTarget(showErrorMessages);
    const optionsValid = this.validateOptions(showErrorMessages);
    return targetValid && optionsValid;
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  @action
  private onSubmitPlan() {
    // Validate input
    if (!this.validateAllInputs()) {
      return;
    }

    // Send the request to the backend.
    const target = this.formText.target;
    const version = this.formText.version;
    const options = JSON.parse(this.formText.options);
    const specId = specificationsState.expandedSpecId;
    // TODO: submittedPlan.pushPath = "";
    this.props.onSubmitPlan({ target, version, options, specId });
  }

  private onTargetChange = event => {
    this.formText.target = event.target.value;
    this.validateTarget(false);
  };

  private forceValidateTarget = () => this.validateTarget();

  private onVersionChange = event => {
    this.formText.version = event.target.value;
  };

  private onOptionsChange = event => {
    this.formText.options = event.target.value;
    this.validateOptions(false);
  };

  private forceValidateOptions = () => this.validateOptions();

  private onAddButtonClick = event => {
    event.preventDefault();
    this.onSubmitPlan();
  };

  public render() {
    const {
      onCloseModal,
      modalProps,
      cancelButtonProps,
      showSubmitProgress,
      submitButtonProps,
    } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <FloatingModal
                key={0}
                classes={{ paper: classes.modalPaper }}
                open
                onClose={onCloseModal}
                {...modalProps}
              >
                <form>
                  <div className={classes.modalContent}>
                    <Typography variant="title" className={classes.title}>
                      Add SDK Generation Plan
                    </Typography>
                    <FormControl error={this.error.target !== undefined} margin="dense">
                      <InputLabel htmlFor="target">Target</InputLabel>
                      <Select
                        onChange={this.onTargetChange}
                        onBlur={this.forceValidateTarget}
                        value={this.formText.target}
                        inputProps={{
                          id: 'target',
                        }}
                      >
                        {PLAN_TARGETS.map(target => (
                          <MenuItem key={target} value={target}>
                            {target}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{this.error.target}</FormHelperText>
                    </FormControl>
                    <FormControl margin="dense">
                      <InputLabel htmlFor="version">Version</InputLabel>
                      <Input
                        id="version"
                        onChange={this.onVersionChange}
                        value={this.formText.version}
                      />
                      <FormHelperText>E.g. 1.2.34</FormHelperText>
                    </FormControl>
                    <FormControl error={this.error.options !== undefined} margin="dense">
                      <InputLabel htmlFor="options">Options</InputLabel>
                      <Input
                        id="options"
                        className={classes.optionsText}
                        onChange={this.onOptionsChange}
                        onBlur={this.forceValidateOptions}
                        value={this.formText.options}
                        multiline
                        rows={5}
                        rowsMax={10}
                      />
                      <FormHelperText>
                        {this.error.options ||
                          'Target-specific options to pass to Swagger Codegen in JSON'}
                      </FormHelperText>
                    </FormControl>
                  </div>

                  <div className={classes.buttonRow}>
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
                  </div>
                </form>
              </FloatingModal>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}

export const storybook: Category<PlanModalProps> = {
  Component: PlanModal,
  stories: {
    Submit: {
      onCloseModal: () => {},
      onSubmitPlan: () => {},
      showSubmitProgress: false,
      submitButtonProps: {
        children: 'Submit',
      },
    },
  },
};
