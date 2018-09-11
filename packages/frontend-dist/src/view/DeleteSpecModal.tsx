import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';

import { state as specState } from '../state/SpecState';

export class DeleteSpecModal extends Component<RouteComponentProps<{ specId: string }>> {
  private closeModal = () => {
    const lastSlash = this.props.match.url.lastIndexOf('/');
    this.props.history.push(this.props.match.url.slice(0, lastSlash));
  };

  private closeModalOnDelete = () => {
    const lastSlash = this.props.match.url.lastIndexOf('/');
    const secondLastSlash = this.props.match.url.lastIndexOf('/', lastSlash - 1);
    this.props.history.push(this.props.match.url.slice(0, secondLastSlash));
  };

  private onDeleteSpec = async () => {
    const {
      match: {
        params: { specId },
      },
    } = this.props;
    if (specId) {
      try {
        await specState.deleteSpec(parseInt(specId, 10));
        this.closeModalOnDelete();
      } catch (e) {
        // TODO: Show an error message
      }
    }
  };

  public render() {
    const {
      match: {
        params: { specId },
      },
    } = this.props;
    const spec = specId !== undefined ? specState.specs.get(parseInt(specId, 10))! : null;
    return (
      <Dialog maxWidth="sm" open={spec !== null} onClose={this.closeModal}>
        <DialogTitle>Delete Specification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {spec !== null ? spec.title : ''}{' '}
            specification?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button color="secondary" onClick={this.onDeleteSpec}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
