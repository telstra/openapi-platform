import React, { Component } from 'react';

import { Button, Typography } from '@material-ui/core';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';

import { FloatingModal } from 'basic/FloatingModal';
import { PlanModal } from 'basic/PlanModal';
import { state as planState, AddedPlan } from 'state/PlanState';
import { state as specState } from 'state/SpecState';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
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
}));

/**
 * A modal window that allows the user to add a SDK Plan to the dashboard.
 * Currently only supports specifying a target, version and options as a valid JSON.
 */
export class AddPlanModal extends Component<RouteComponentProps<{}>, {}> {
  /**
   * Whether or not a progress indicator should be shown
   */
  @observable private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to add Plan' modal is open
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
  private onSubmitPlan = async (submittedPlan: AddedPlan) => {
    this.showProgressIndicator = true;
    try {
      if (specState.expandedSpecId === null) {
        throw new Error('expandedSpecId was unexpectedly null');
      }
      await planState.addPlan({ ...submittedPlan, specId: specState.expandedSpecId });
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
              <PlanModal
                key={0}
                submitButtonProps={{
                  children: 'Add',
                }}
                onSubmitPlan={this.onSubmitPlan}
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
                  <Typography>An error occurred adding the SDK Plan.</Typography>
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
