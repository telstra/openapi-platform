import React, { Component, ReactNode } from 'react';
import { RouteComponentProps } from 'react-router';
import { observable, action, autorun, computed } from 'mobx';
import { Observer } from 'mobx-react';
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from 'material-ui';
import { ButtonProps } from 'material-ui/Button';
import { ModalProps } from 'material-ui/Modal';
import classNames from 'classnames';
import { isWebUri } from 'valid-url';
import { Category } from 'model/Storybook';
import { Sdk, AddedSdk, SDK_TARGETS } from 'model/Sdk';
import { createStyled } from 'view/createStyled';
import { FloatingModal } from 'basic/FloatingModal';

const Styled: any = createStyled(theme => ({
  modalPaper: {
    maxWidth: theme.spacing.unit * 64
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 3
  },
  optionsText: {
    fontFamily: 'Roboto Mono'
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing.unit
  },
  progressIndicator: {
    margin: `0 ${theme.spacing.unit * 4}px`
  }
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
export type OnSubmitSdk = (sdk: AddedSdk) => void;
export interface SdkModalProps {
  readonly onCloseModal: OnCloseModal;
  readonly onSubmitSdk: OnSubmitSdk;
  readonly cancelButtonProps?: ButtonProps;
  readonly submitButtonProps?: ButtonProps;
  readonly showSubmitProgress?: boolean;
  readonly modalProps?: ModalProps;
}

/**
 * A modal window that allows the user to add a specification to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class SdkModal extends Component<SdkModalProps> {
  /**
   * Currently entered form data
   */
  @observable
  private readonly formText: FormText = {
    target: '',
    version: '',
    options: '{}'
  };

  /**
   * Current error messages (if any) for each form field
   */
  @observable
  private readonly error: FormError = {
    target: undefined,
    options: undefined
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
   * Checks whether the SDK's target input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  validateTarget(showErrorMesssage: boolean = true): boolean {
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
`  * @returns An error message if the options are invalid in some way
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
   * Checks whether the SDK's options input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  validateOptions(showErrorMesssage: boolean = true): boolean {
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
  validateAllInputs(showErrorMessages: boolean = true) {
    const targetValid = this.validateTarget(showErrorMessages);
    const optionsValid = this.validateOptions(showErrorMessages);
    return targetValid && optionsValid;
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  @action
  async onSubmitSdk() {
    // Validate input
    if (!this.validateAllInputs()) {
      return;
    }

    // Send the request to the backend
    const target = this.formText.target;
    const version = this.formText.version;
    const options = JSON.parse(this.formText.options);
    this.props.onSubmitSdk({ target, version, options });
  }

  render() {
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <FloatingModal
                key={0}
                classes={{ paper: classes.modalPaper }}
                open={true}
                onClose={() => this.props.onCloseModal()}
                {...this.props.modalProps}
              >
                <form>
                  <div className={classes.modalContent}>
                    <Typography variant="title" className={classes.title}>
                      Add SDK
                    </Typography>
                    <FormControl error={this.error.target !== undefined} margin="dense">
                      <InputLabel htmlFor="target">Target</InputLabel>
                      <Select
                        onChange={event => {
                          this.formText.target = event.target.value;
                          this.validateTarget(false);
                        }}
                        onBlur={() => this.validateTarget()}
                        value={this.formText.target}
                        inputProps={{
                          id: 'target'
                        }}
                      >
                        {SDK_TARGETS.map(target => (
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
                        onChange={event => {
                          this.formText.version = event.target.value;
                        }}
                        value={this.formText.version}
                      />
                      <FormHelperText>E.g. 1.2.34</FormHelperText>
                    </FormControl>
                    <FormControl error={this.error.options !== undefined} margin="dense">
                      <InputLabel htmlFor="options">Options</InputLabel>
                      <Input
                        id="options"
                        className={classes.optionsText}
                        onChange={event => {
                          this.formText.options = event.target.value;
                          this.validateOptions(false);
                        }}
                        onBlur={() => this.validateOptions()}
                        value={this.formText.options}
                        multiline={true}
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
                      onClick={() => this.props.onCloseModal()}
                      {...this.props.cancelButtonProps}
                    >
                      Cancel
                    </Button>
                    {this.props.showSubmitProgress ? (
                      <CircularProgress size={24} className={classes.progressIndicator} />
                    ) : (
                      <Button
                        color="primary"
                        type="submit"
                        onClick={() => this.onSubmitSdk()}
                        {...this.props.submitButtonProps}
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

export const storybook: Category<SdkModalProps> = {
  Component: SdkModal,
  stories: {
    Submit: {
      onCloseModal: () => {},
      onSubmitSdk: () => {},
      showSubmitProgress: false,
      submitButtonProps: {
        children: 'Submit'
      }
    }
  }
};
