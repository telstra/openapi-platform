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

interface AddSpecificationModalState {
  // Currently entered form data
  formText: {
    title: string;
    url: string;
    description: string;
  };
  // Current error messages (if any) for each form field
  error: {
    title: string | null;
    url: string | null;
  };
  // Whether or not a progress indicator should be shown
  showProgressIndicator: boolean;
  // Whether or not the 'failed to add specification' modal is open
  showErrorModal: boolean;
}

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

/**
 * A modal window that allows the user to add a specification to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class AddSpecificationModal extends Component<
  RouteComponentProps<{}>,
  AddSpecificationModalState
> {
  /**
   * Constructor for AddSpecificationModal.
   *
   * @param props The properties to construct the component with.
   */
  constructor(props: RouteComponentProps<{}>) {
    super(props);
    this.state = {
      formText: {
        title: '',
        url: '',
        description: ''
      },
      error: {
        title: null,
        url: null
      },
      showProgressIndicator: false,
      showErrorModal: false
    };
  }

  /**
   * Closes the modal.
   */
  closeModal(force: boolean = false) {
    this.props.history.replace('/');
  }

  /**
   * Shows the 'failed to add specification' modal.
   */
  showFailureModal() {
    this.setState({
      showErrorModal: true
    });
  }

  /**
   * Hides the 'failed to add specification' modal.
   */
  hideFailureModal() {
    this.setState({
      showErrorModal: false
    });
  }

  /**
   * Shows the progress indicators.
   */
  showProgressindicator() {
    this.setState({
      showProgressIndicator: true
    });
  }

  /**
   * Hides the progress indicator.
   */
  hideProgressIndicator() {
    this.setState({
      showProgressIndicator: false
    });
  }

  /**
   * Stores the value of the given text field.
   *
   * @param field The field to set the value of.
   * @param value The value to set.
   */
  setFormText(field: keyof AddSpecificationModalState['formText'], value: string) {
    this.setState(
      prevState => ({
        formText: {
          ...prevState.formText,
          [field]: value
        }
      }),
      () => this.validateInput(true)
    );
  }

  /**
   * Sets the error message for the given text field.
   *
   * @param field The field to set the error of.
   * @param error The error message to set, or null to clear the error message.
   */
  setFormError(
    field: keyof AddSpecificationModalState['formText'],
    error: string | null
  ) {
    this.setState(prevState => ({
      error: {
        ...prevState.error,
        [field]: error
      }
    }));
  }

  /**
   * Validates all form input.
   *
   * @param clearOnly If true, only clears validation errors rather than adding them.
   * @returns true if the input was valid, false otherwise.
   */
  validateInput(clearOnly: boolean) {
    let valid = true;
    const title = this.state.formText.title;
    if (title === '') {
      if (!clearOnly) {
        this.setFormError('title', 'Error: Missing title');
      }
      valid = false;
    } else {
      this.setFormError('title', null);
    }
    const url = isWebUri(this.state.formText.url);
    if (url === undefined) {
      if (!clearOnly) {
        this.setFormError('url', 'Error: Invalid URL');
      }
      valid = false;
    } else {
      this.setFormError('url', null);
    }
    return valid;
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  async onAddSpecification() {
    // Validate input
    if (!this.validateInput(false)) {
      return;
    }

    // Send the request to the backend
    this.showProgressindicator();
    const title = this.state.formText.title;
    const path = isWebUri(this.state.formText.url);
    const description =
      this.state.formText.description === ''
        ? undefined
        : this.state.formText.description;
    if (await specificationState.addSpecification(title, path, description)) {
      // Request was successful
      this.closeModal();
    } else {
      // Request failed
      this.showFailureModal();
      this.hideProgressIndicator();
    }
  }

  /**
   * Renders the modal.
   */
  render() {
    return (
      <Styled>
        {({ classes }) => (
          <div>
            <Modal
              open={true}
              onClose={() => {
                // Don't allow the modal to close if we're waiting for a specification to be added
                if (!this.state.showProgressIndicator) {
                  this.closeModal();
                }
              }}
            >
              <div className={classes.modalPaper}>
                <div className={classes.modalContent}>
                  <Typography variant="title">Add Specification</Typography>
                  <TextField
                    label={this.state.error.title || 'Title'}
                    error={this.state.error.title !== null}
                    onChange={event => this.setFormText('title', event.target.value)}
                    value={this.state.formText.title}
                    margin="normal"
                  />
                  <TextField
                    label={this.state.error.url || 'URL'}
                    error={this.state.error.url !== null}
                    onChange={event => this.setFormText('url', event.target.value)}
                    value={this.state.formText.url}
                    margin="normal"
                  />
                  <TextField
                    label="Description"
                    onChange={event =>
                      this.setFormText('description', event.target.value)
                    }
                    value={this.state.formText.description}
                    multiline={true}
                    rowsMax={3}
                    margin="normal"
                  />
                </div>
                <div className={classes.buttonRow}>
                  <Button
                    color="primary"
                    disabled={this.state.showProgressIndicator}
                    onClick={() => this.closeModal()}
                  >
                    Cancel
                  </Button>
                  {this.state.showProgressIndicator ? (
                    <CircularProgress size={24} className={classes.progressIndicator} />
                  ) : (
                    <Button color="primary" onClick={() => this.onAddSpecification()}>
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </Modal>
            <Modal
              open={this.state.showErrorModal}
              onClose={() => this.hideFailureModal()}
            >
              <div className={classNames(classes.modalPaper, classes.errorModalPaper)}>
                <div className={classes.modalContent}>
                  <Typography variant="title">Error</Typography>
                  <Typography>An error occurred adding the specification.</Typography>
                </div>
                <div className={classes.buttonRow}>
                  <Button color="primary" onClick={() => this.hideFailureModal()}>
                    Ok
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </Styled>
    );
  }
}
