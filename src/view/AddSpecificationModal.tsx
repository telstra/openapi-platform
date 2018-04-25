import React, { Component, ReactNode } from 'react';
import { Observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { CircularProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Modal from 'material-ui/Modal';
import classNames from 'classnames';
import { isWebUri } from 'valid-url';
import { state as specificationState } from 'state/SpecificationState';
import { Specification } from 'model/Specification';
import { createStyled } from 'view/createStyled';
import { observable, action, autorun, computed } from 'mobx';
const Styled: any = createStyled(theme => ({
  modalPaper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    top: '50%',
    left: `50%`,
    width: `calc(100% - ${theme.spacing.unit * 4}px)`,
    maxWidth: theme.spacing.unit * 64,
    margin: `0 ${theme.spacing.unit * 2}px`,
    transform: `translate(-50%, -50%) translateX(${-theme.spacing.unit * 2}px)`
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

interface FormText {
  title?: string;
  url?: string;
  description?: string;
}

interface FormError {
  title?: string;
  url?: string;
}
/**
 * A modal window that allows the user to add a specification to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class AddSpecificationModal extends Component<RouteComponentProps<{}>, {}> {
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
   * Whether or not a progress indicator should be shown
   */
  @observable private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to add specification' modal is open
   */
  @observable private showErrorModal: boolean = false;

  closeModal() {
    this.props.history.replace('/');
  }

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
    if (showErrorMesssage && this.urlError) {
      this.error.url = this.urlError;
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
    if (showErrorMesssage && this.titleError) {
      this.error.title = this.titleError;
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
  async onAddSpecification() {
    // Validate input
    if (!this.validateAllInputs()) {
      return;
    }

    // Send the request to the backend
    this.showProgressIndicator = true;
    const title = this.formText.title;
    const path = isWebUri(this.formText.url);
    const description =
      this.formText.description === '' ? undefined : this.formText.description;
    if (await specificationState.addSpecification({ title, path, description })) {
      // Request was successful
      this.closeModal();
    } else {
      // Request failed
      this.showErrorModal = true;
      this.showProgressIndicator = false;
    }
  }

  render() {
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <div>
                <Modal
                  open={true}
                  onClose={() => {
                    // Don't allow the modal to close if we're waiting for a specification to be added
                    if (!this.showProgressIndicator) {
                      this.closeModal();
                    }
                  }}
                >
                  <div className={classes.modalPaper}>
                    <div className={classes.modalContent}>
                      <Typography variant="title">Add Specification</Typography>
                      <TextField
                        label={this.error.title || 'Title'}
                        error={this.error.title !== undefined}
                        onChange={event => {
                          this.formText.title = event.target.value;
                          this.validateTitle(false);
                        }}
                        onBlur={() => this.validateTitle()}
                        value={this.formText.title}
                        margin="normal"
                      />
                      <TextField
                        label={this.error.url || 'URL'}
                        error={this.error.url !== undefined}
                        onChange={event => {
                          this.formText.url = event.target.value;
                          this.validateUrl(false);
                        }}
                        onBlur={() => this.validateUrl()}
                        value={this.formText.url}
                        margin="normal"
                      />
                      <TextField
                        label="Description"
                        onChange={event =>
                          (this.formText.description = event.target.value)
                        }
                        value={this.formText.description}
                        multiline={true}
                        rowsMax={3}
                        margin="normal"
                      />
                    </div>
                    <div className={classes.buttonRow}>
                      <Button
                        color="primary"
                        disabled={this.showProgressIndicator}
                        onClick={() => this.closeModal()}
                      >
                        Cancel
                      </Button>
                      {this.showProgressIndicator ? (
                        <CircularProgress
                          size={24}
                          className={classes.progressIndicator}
                        />
                      ) : (
                        <Button color="primary" onClick={() => this.onAddSpecification()}>
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </Modal>
                <Modal
                  open={this.showErrorModal}
                  onClose={() => (this.showErrorModal = false)}
                >
                  <div
                    className={classNames(classes.modalPaper, classes.errorModalPaper)}
                  >
                    <div className={classes.modalContent}>
                      <Typography variant="title">Error</Typography>
                      <Typography>An error occurred adding the specification.</Typography>
                    </div>
                    <div className={classes.buttonRow}>
                      <Button
                        color="primary"
                        onClick={() => (this.showErrorModal = false)}
                      >
                        Ok
                      </Button>
                    </div>
                  </div>
                </Modal>
              </div>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}
