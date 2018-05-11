import React, { Component, ReactNode } from 'react';
import { Observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import {
  CircularProgress,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Input,
  Typography,
  Modal
} from 'material-ui';
import { ButtonProps } from 'material-ui/Button';
import { ModalProps } from 'material-ui/Modal';
import classNames from 'classnames';
import { isWebUri } from 'valid-url';
import { Spec } from 'model/Spec';
import { AddedSpecification } from 'state/SpecState';
import { createStyled } from 'view/createStyled';
import { observable, action, autorun, computed } from 'mobx';
import { FloatingModal } from 'basic/FloatingModal';
import { Category } from 'model/Storybook';
const Styled: any = createStyled(theme => ({
  modalPaper: {
    maxWidth: theme.spacing.unit * 64
  },
  errorModalPaper: {
    maxWidth: theme.spacing.unit * 48
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 3
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
  title?: string;
  url?: string;
  description?: string;
}

export interface FormError {
  title?: string;
  url?: string;
}

export type OnCloseModal = () => void;
export type OnSubmitSpecification = (spec: AddedSpecification) => void;
export type OnError = (error: FormError) => void;
export interface SpecModalProps {
  readonly onCloseModal: OnCloseModal;
  readonly onSubmitSpecification: OnSubmitSpecification;
  readonly cancelButtonProps?: ButtonProps;
  readonly submitButtonProps?: ButtonProps;
  readonly showSubmitProgress?: boolean;
  readonly modalProps?: ModalProps;
}

/**
 * A modal window that allows the user to add a specification to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class SpecModal extends Component<SpecModalProps> {
  /**
   * Currently entered form data
   */
  @observable
  private readonly formText: FormText = {
    title: '',
    url: '',
    description: ''
  };

  /**
   * Current error messages (if any) for each form field
   */
  @observable
  private readonly error: FormError = {
    title: undefined,
    url: undefined
  };

  /**
   * Whether or not the 'failed to add specification' modal is open
   */
  @observable private showErrorModal: boolean = false;

  /**
   * @returns An error message if the title is invalid in some way
   */
  @computed
  get titleError(): string | undefined {
    const title = this.formText.title;
    return !title ? 'Error: Missing title' : undefined;
  }

  /**
   * @returns An error message if the url is invalid in some way
   */
  @computed
  get urlError(): string | undefined {
    const url = this.formText.url;
    if (!url) {
      return 'Error: URL cannot be empty';
    } else if (!isWebUri(url)) {
      return 'Error: Invalid URL';
    } else {
      return undefined;
    }
  }

  /**
   * Checks whether the specification's URL input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  validateUrl(showErrorMesssage: boolean = true): boolean {
    let valid: boolean;
    if (this.urlError) {
      if (showErrorMesssage) {
        this.error.url = this.urlError;
      }
      valid = false;
    } else {
      this.error.url = undefined;
      valid = true;
    }
    return valid;
  }

  /**
   * Checks whether the specification's title input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  validateTitle(showErrorMesssage: boolean = true): boolean {
    let valid: boolean;
    if (this.titleError) {
      if (showErrorMesssage) {
        this.error.title = this.titleError;
      }
      valid = false;
    } else {
      this.error.title = undefined;
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
    return this.validateTitle(showErrorMessages) && this.validateUrl(showErrorMessages);
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  @action
  async onSubmitSpecification() {
    // Validate input
    if (!this.validateAllInputs()) {
      return;
    }

    // Send the request to the backend
    const title = this.formText.title;
    const path = isWebUri(this.formText.url);
    const description = this.formText.description;
    this.props.onSubmitSpecification({ title, path, description });
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
                      Add Specification
                    </Typography>
                    <FormControl error={this.error.title !== undefined} margin="normal">
                      <InputLabel htmlFor="title">Title</InputLabel>
                      <Input
                        id="title"
                        onChange={event => {
                          this.formText.title = event.target.value;
                          this.validateTitle(false);
                        }}
                        onBlur={() => this.validateTitle()}
                        value={this.formText.title}
                      />
                      <FormHelperText>
                        {this.error.title || 'E.g. Petstore'}
                      </FormHelperText>
                    </FormControl>
                    <FormControl error={this.error.url !== undefined} margin="dense">
                      <InputLabel htmlFor="url">URL</InputLabel>
                      <Input
                        id="url"
                        onChange={event => {
                          this.formText.url = event.target.value;
                          this.validateUrl(false);
                        }}
                        error={this.error.url !== undefined}
                        onBlur={() => this.validateUrl()}
                        value={this.formText.url}
                      />
                      <FormHelperText>
                        {this.error.url ||
                          'E.g. http://petstore.swagger.io/v2/swagger.json'}
                      </FormHelperText>
                    </FormControl>
                    <FormControl margin="dense">
                      <InputLabel htmlFor="description">Description</InputLabel>
                      <Input
                        id="description"
                        onChange={event =>
                          (this.formText.description = event.target.value)
                        }
                        value={this.formText.description}
                        multiline={true}
                        rowsMax={3}
                      />
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
                        onClick={() => this.onSubmitSpecification()}
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

export const storybook: Category<SpecModalProps> = {
  Component: SpecModal,
  stories: {
    Submit: {
      onCloseModal: () => {},
      onSubmitSpecification: () => {},
      showSubmitProgress: false,
      submitButtonProps: {
        children: 'Submit'
      }
    }
  }
};
