import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@material-ui/core';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';

import { state as specState } from '../state/SpecState';
import { goUpUrl } from '../util/goUpUrl';
import { createStyled } from './createStyled';

const Styled: any = createStyled(theme => ({
  progressIndicator: {
    margin: `0 ${theme.spacing.unit * 4}px`,
  },
}));

export class DeleteSpecModal extends Component<RouteComponentProps<{ specId: string }>> {
  /**
   * Whether or not a progress indicator should be shown
   */
  @observable
  private showProgressIndicator: boolean = false;

  /**
   * Whether or not the 'failed to delete specification' modal is open
   */
  @observable
  private showErrorModal: boolean = false;

  private closeModal = () => {
    this.props.history.push(goUpUrl(this.props.match.url));
  };

  private closeModalOnDelete = () => {
    this.props.history.push(goUpUrl(this.props.match.url, 2));
  };

  private closeErrorModal = () => {
    this.showErrorModal = false;
  };

  /**
   * Event fired when the user presses the 'Delete' button.
   */
  @action
  private onDeleteSpec = async () => {
    this.showProgressIndicator = true;
    try {
      await specState.deleteSpec(parseInt(this.props.match.params.specId, 10));
      this.closeModalOnDelete();
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
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <>
                <Dialog maxWidth="xs" open onClose={this.closeModal}>
                  <DialogTitle>Delete Specification</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to delete the{' '}
                      {specId && specState.entities.has(parseInt(specId, 10))
                        ? specState.entities.get(parseInt(specId, 10))!.title
                        : ''}{' '}
                      specification?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button color="primary" onClick={this.closeModal}>
                      Cancel
                    </Button>
                    {this.showProgressIndicator ? (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        className={classes.progressIndicator}
                      />
                    ) : (
                      <Button color="secondary" type="submit" onClick={this.onDeleteSpec}>
                        Delete
                      </Button>
                    )}
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={this.showErrorModal}
                  onClose={this.closeErrorModal}
                  maxWidth="xs"
                >
                  <DialogTitle>Error</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      An error occurred deleting the specification.
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
        )}
      </Styled>
    );
  }
}
