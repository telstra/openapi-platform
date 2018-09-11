import React, { Component } from 'react';

import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';

import { Spec } from '@openapi-platform/model';
import { state as specState } from '../state/SpecState';
import { SpecModal } from './basic/SpecModal';

/**
 * A modal window that allows the user to add a Spec to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class AddSpecModal extends Component<
  RouteComponentProps<{ specId?: string }>,
  {}
> {
  /**
   * Whether or not a progress indicator should be shown
   */
  @observable
  private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to add specification' modal is open
   */
  @observable
  private showErrorModal: boolean = false;

  private closeModal = () => {
    const lastSlash = this.props.match.url.lastIndexOf('/');
    this.props.history.push(this.props.match.url.slice(0, lastSlash));
  };

  @action
  private closeErrorModal = () => {
    this.showErrorModal = false;
  };

  /**
   * Event fired when the user presses the 'Add' or 'Update' button.
   */
  @action
  private onSubmitSpec = async (submittedSpec: Spec) => {
    this.showProgressIndicator = true;
    try {
      if (this.props.match.params.specId) {
        await specState.updateSpec(
          parseInt(this.props.match.params.specId, 10),
          submittedSpec,
        );
      } else {
        await specState.addSpec(submittedSpec);
      }
      this.closeModal();
    } catch (e) {
      console.error(e);
      this.showErrorModal = true;
    } finally {
      this.showProgressIndicator = false;
    }
  };

  public render() {
    const {
      match: {
        params: { specId },
      },
    } = this.props;
    return (
      <Observer>
        {() => [
          <SpecModal
            key={0}
            initialSpec={specId ? specState.specs.get(parseInt(specId, 10)) : undefined}
            titleProps={{
              children: specId ? 'Update Specification' : 'Add Specification',
            }}
            submitButtonProps={{
              children: specId ? 'Update' : 'Add',
            }}
            onSubmitSpec={this.onSubmitSpec}
            onCloseModal={this.closeModal}
            showSubmitProgress={this.showProgressIndicator}
          />,
          <Dialog
            key={1}
            open={this.showErrorModal}
            onClose={this.closeErrorModal}
            maxWidth="xs"
          >
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
              <DialogContentText>
                An error occurred {specId ? 'updating' : 'adding'} the specification.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.closeErrorModal}>
                Ok
              </Button>
            </DialogActions>
          </Dialog>,
        ]}
      </Observer>
    );
  }
}
