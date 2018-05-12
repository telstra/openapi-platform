import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';

import { FloatingModal } from 'basic/FloatingModal';
import { SpecificationModal } from 'basic/SpecificationModal';
import {
  state as specificationState,
  AddedSpecification,
} from 'state/SpecificationState';
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

/**
 * A modal window that allows the user to add a specification to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class AddSpecificationModal extends Component<RouteComponentProps<{}>, {}> {
  /**
   * Whether or not a progress indicator should be shown
   */
  @observable private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to add specification' modal is open
   */
  @observable private showErrorModal: boolean = false;

  private closeModal = () => {
    this.props.history.push('/');
  };

  private closeErrorModal = () => {
    this.showErrorModal = false;
  };

  /**
   * Event fired when the user presses the 'Add' button.
   */
  @action
  private onAddSpecification = async (submittedSpecification: AddedSpecification) => {
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
  };

  public render() {
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => [
              <SpecificationModal
                key={0}
                submitButtonProps={{
                  children: 'Add',
                }}
                onSubmitSpecification={this.onAddSpecification}
                onCloseModal={this.closeModal}
                showSubmitProgress={this.showProgressIndicator}
              />,
              <FloatingModal
                key={1}
                open={this.showErrorModal}
                onClose={this.closeErrorModal}
                classes={{ paper: classes.errorModalPaper }}
              >
                <div className={classes.modalContent}>
                  <Typography variant="title">Error</Typography>
                  <Typography>An error occurred adding the specification.</Typography>
                </div>
                <div className={classes.buttonRow}>
                  <Button color="primary" onClick={this.closeErrorModal}>
                    Ok
                  </Button>
                </div>
              </FloatingModal>,
            ]}
          </Observer>
        )}
      </Styled>
    );
  }
}
