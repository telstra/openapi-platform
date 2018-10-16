import React, { Component } from 'react';

import {
  Button,
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
import { goUpUrl } from '../util/goUpUrl';
import { SpecModal } from './basic/SpecModal';

/**
 * A modal window that allows the user to add a Spec to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class AddSpecModal extends Component<RouteComponentProps<{ id?: string }>, {}> {
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
    this.props.history.push(goUpUrl(this.props.match.url));
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
      if (this.props.match.params.id) {
        await specState.updateSpec(
          parseInt(this.props.match.params.id, 10),
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
        params: { id },
      },
    } = this.props;
    return (
      <Observer>
        {() => (
          <>
            <SpecModal
              initialSpec={id ? specState.specs.get(parseInt(id, 10)) : undefined}
              titleProps={{
                children: id ? 'Update Specification' : 'Add Specification',
              }}
              submitButtonProps={{
                children: id ? 'Update' : 'Add',
              }}
              onSubmitSpec={this.onSubmitSpec}
              onCloseModal={this.closeModal}
              showSubmitProgress={this.showProgressIndicator}
            />
            <Dialog
              open={this.showErrorModal}
              onClose={this.closeErrorModal}
              maxWidth="xs"
            >
              <DialogTitle>Error</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  An error occurred {id ? 'updating' : 'adding'} the specification.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button color="primary" onClick={this.closeErrorModal}>
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Observer>
    );
  }
}
