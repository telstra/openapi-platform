import {
  CircularProgress,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  Input,
  Typography,
} from 'material-ui';
import { ButtonProps } from 'material-ui/Button';
import { ModalProps } from 'material-ui/Modal';
import { observable, action, computed } from 'mobx';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { isWebUri } from 'valid-url';

import { FloatingModal } from 'basic/FloatingModal';
import { Category } from 'model/Storybook';
import { AddedSpecification } from 'state/SpecificationState';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
  modalPaper: {
    maxWidth: theme.spacing.unit * 64,
  },
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
  progressIndicator: {
    margin: `0 ${theme.spacing.unit * 4}px`,
  },
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
export interface SpecificationModalProps {
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
export class SpecificationModal extends Component<SpecificationModalProps> {
  /**
   * Currently entered form data
   */
  @observable
  private readonly formText: FormText = {
    title: '',
    url: '',
    description: '',
  };

  /**
   * Current error messages (if any) for each form field
   */
  @observable
  private readonly error: FormError = {
    title: undefined,
    url: undefined,
  };

  /**
   * Whether or not the 'failed to add specification' modal is open
   */
  // TODO: use this for something
  // tslint:disable-next-line
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
  private validateUrl = (showErrorMesssage: boolean = true): boolean => {
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
  };

  /**
   * Checks whether the specification's title input is valid
   * @param showErrorMesssage If false, clear the error message
   */
  @action
  private validateTitle = (showErrorMesssage: boolean = true): boolean => {
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
  };

  /**
   * @param showErrorMessages If false, only clears validation errors rather than adding them.
   * @returns true if the input was valid, false otherwise.
   */
  @action
  private validateAllInputs(showErrorMessages: boolean = true) {
    return this.validateTitle(showErrorMessages) && this.validateUrl(showErrorMessages);
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  @action
  private onSubmitSpecification = async () => {
    // Validate input
    if (!this.validateAllInputs()) {
      return;
    }

    // Send the request to the backend
    const title = this.formText.title;
    const path = isWebUri(this.formText.url);
    const description = this.formText.description;
    this.props.onSubmitSpecification({ title, path, description });
  };

  private onTitleChange = event => {
    this.formText.title = event.target.value;
    this.validateTitle(false);
  };

  private forceValidateTitle = () => this.validateTitle();

  private onUrlChange = event => {
    this.formText.url = event.target.value;
    this.validateUrl(false);
  };

  private forceValidateUrl = () => this.validateUrl();

  private onFormTextChange = event => (this.formText.description = event.target.value);

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
                      Add Specification
                    </Typography>
                    <FormControl error={this.error.title !== undefined} margin="normal">
                      <InputLabel htmlFor="title">Title</InputLabel>
                      <Input
                        id="title"
                        onChange={this.onTitleChange}
                        onBlur={this.forceValidateTitle}
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
                        onChange={this.onUrlChange}
                        error={this.error.url !== undefined}
                        onBlur={this.forceValidateUrl}
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
                        onChange={this.onFormTextChange}
                        value={this.formText.description}
                        multiline
                        rowsMax={3}
                      />
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
                        onClick={this.onSubmitSpecification}
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

export const storybook: Category<SpecificationModalProps> = {
  Component: SpecificationModal,
  stories: {
    Submit: {
      onCloseModal: () => {},
      onSubmitSpecification: () => {},
      showSubmitProgress: false,
      submitButtonProps: {
        children: 'Submit',
      },
    },
  },
};
