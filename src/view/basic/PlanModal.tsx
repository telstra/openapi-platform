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
import { Observer } from 'mobx-react';

import { FloatingModal } from 'basic/FloatingModal';
import {
  ValidatedFormStore,
  inputValid,
  inputInvalid,
  alwaysValid,
} from 'frontend/ValidatedFormStore';
import { PLAN_TARGETS } from 'model/Plan';
import { Category } from 'model/Storybook';
import { AddedPlan } from 'state/PlanState';
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

// type PlanModalInput = 'target' | 'version' | 'options';

/**
 * A modal window that allows the user to add a SDK generation Plan to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class PlanModal extends Component<PlanModalProps> {
  /**
   * Stores all form data and handles input validation logic.
   */
  private inputStore = new ValidatedFormStore({
    target: {
      validation: target =>
        !PLAN_TARGETS.includes(target)
          ? inputInvalid('Error: Missing target')
          : inputValid(),
      initialValue: '',
    },
    version: {
      validation: alwaysValid,
      initialValue: '',
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
      initialValue: '{}',
    },
  });

  /**
   * Event fired when the user presses the 'Add' button.
   */
  private onSubmitPlan() {
    // Validate input
    if (!this.inputStore.inputsValid) {
      this.inputStore.updateAllInputErrors();
      return;
    }

    // Send the request to the backend.
    const target = this.inputStore.getInputValue('target');
    const version = this.inputStore.getInputValue('version');
    const options = JSON.parse(this.inputStore.getInputValue('options'));
    // TODO: submittedPlan.pushPath = "";
    this.props.onSubmitPlan({ target, version, options });
  }

  private onInputChange = event =>
    this.inputStore.setInputValue(event.target.id, event.target.value);
  private onInputBlur = event => this.inputStore.updateInputError(event.target.id);
  private onTargetChange = event =>
    this.inputStore.setInputValue('target', event.target.value);
  private onTargetBlur = () => this.inputStore.updateInputError('target');

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
                        {PLAN_TARGETS.map(target => (
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
