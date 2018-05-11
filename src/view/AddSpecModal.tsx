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
import { state as specificationState, AddedSpecification } from 'state/SpecState';
import { Spec } from 'model/Spec';
import { createStyled } from 'view/createStyled';
import { observable, action, autorun, computed } from 'mobx';
import { SpecModal } from 'basic/SpecModal';
import { FloatingModal } from 'basic/FloatingModal';
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
export class AddSpecModal extends Component<RouteComponentProps<{}>, {}> {
  /**
   * Whether or not a progress indicator should be shown
   */
  @observable private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to add specification' modal is open
   */
  @observable private showErrorModal: boolean = false;

  closeModal() {
    this.props.history.push('/');
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  @action
  async onAddSpecification(submittedSpecification: AddedSpecification) {
    this.showProgressIndicator = true;
    try {
      await specificationState.addSpecification(submittedSpecification);
      this.closeModal();
    } catch (e) {
      console.error(e);
      this.showErrorModal = true;
    } finally {
      this.showProgressIndicator = false;
    }
  }

  render() {
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => [
              <SpecModal
                submitButtonProps={{
                  children: 'Add'
                }}
                onSubmitSpecification={specification =>
                  this.onAddSpecification(specification)
                }
                onCloseModal={() => this.closeModal()}
                showSubmitProgress={this.showProgressIndicator}
              />,
              <FloatingModal
                key={1}
                open={this.showErrorModal}
                onClose={() => (this.showErrorModal = false)}
                classes={{ paper: classes.errorModalPaper }}
              >
                <div className={classes.modalContent}>
                  <Typography variant="title">Error</Typography>
                  <Typography>An error occurred adding the specification.</Typography>
                </div>
                <div className={classes.buttonRow}>
                  <Button color="primary" onClick={() => (this.showErrorModal = false)}>
                    Ok
                  </Button>
                </div>
              </FloatingModal>
            ]}
          </Observer>
        )}
      </Styled>
    );
  }
}
