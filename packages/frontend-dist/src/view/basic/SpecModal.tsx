import React, { Component } from 'react';

import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { DialogProps } from '@material-ui/core/Dialog';
import { DialogTitleProps } from '@material-ui/core/DialogTitle';
import { Observer } from 'mobx-react';
import { isWebUri } from 'valid-url';

import { Spec } from '@openapi-platform/model';

import { Category } from '../../Storybook';
import {
  ValidatedFormStore,
  inputValid,
  inputInvalid,
  alwaysValid,
} from '../../ValidatedFormStore';
import { createStyled } from '../createStyled';

const Styled: any = createStyled(theme => ({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  progressIndicator: {
    margin: `0 ${theme.spacing.unit * 4}px`,
  },
}));

export type OnCloseModal = () => void;
export type OnSubmitSpec = (spec: Partial<Spec>) => void;
export interface SpecModalProps {
  readonly initialSpec?: Spec;
  readonly onCloseModal: OnCloseModal;
  readonly onSubmitSpec: OnSubmitSpec;
  readonly titleProps?: DialogTitleProps;
  readonly cancelButtonProps?: ButtonProps;
  readonly submitButtonProps?: ButtonProps;
  readonly showSubmitProgress?: boolean;
  readonly dialogProps?: DialogProps;
}

/**
 * A modal window that allows the user to add a Spec to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class SpecModal extends Component<SpecModalProps> {
  /**
   * Stores all form data and handles input validation logic.
   */
  private inputStore = new ValidatedFormStore({
    title: {
      validation: title => (!title ? inputInvalid('Error: Missing title') : inputValid()),
      initialValue: this.props.initialSpec ? this.props.initialSpec.title : '',
    },
    url: {
      validation: url => {
        if (!url) {
          return inputInvalid('Error: URL cannot be empty');
        } else if (!isWebUri(url)) {
          return inputInvalid('Error: Invalid URL');
        }
        return inputValid();
      },
      initialValue: this.props.initialSpec ? this.props.initialSpec.path : '',
    },
    description: {
      validation: alwaysValid,
      initialValue:
        this.props.initialSpec && this.props.initialSpec.description
          ? this.props.initialSpec.description
          : '',
    },
  });

  /**
   * Event fired when the user presses the 'Add' button.
   */
  private onSubmitSpec = () => {
    // Validate input
    if (!this.inputStore.inputsValid) {
      this.inputStore.updateAllInputErrors();
      return;
    }

    // Send the request to the backend
    const title = this.inputStore.getInputValue('title');
    const path = isWebUri(this.inputStore.getInputValue('url'));
    const description = this.inputStore.getInputValue('description');
    this.props.onSubmitSpec({ title, path, description });
  };

  private onInputChange = event =>
    this.inputStore.setInputValue(event.target.id, event.target.value);
  private onInputBlur = event => this.inputStore.updateInputError(event.target.id);

  public render() {
    const {
      onCloseModal,
      dialogProps,
      titleProps,
      cancelButtonProps,
      showSubmitProgress,
      submitButtonProps,
    } = this.props;

    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <Dialog
                open
                onClose={onCloseModal}
                maxWidth="sm"
                fullWidth
                {...dialogProps}
              >
                <form>
                  <DialogTitle {...titleProps} />
                  <DialogContent classes={{ root: classes.modalContent }}>
                    <FormControl
                      error={this.inputStore.getInputError('title') !== null}
                      margin="normal"
                    >
                      <InputLabel htmlFor="title">Title</InputLabel>
                      <Input
                        id="title"
                        onChange={this.onInputChange}
                        onBlur={this.onInputBlur}
                        value={this.inputStore.getInputValue('title')}
                      />
                      <FormHelperText>
                        {this.inputStore.getInputError('title') || 'E.g. Petstore'}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      error={this.inputStore.getInputError('url') !== null}
                      margin="dense"
                    >
                      <InputLabel htmlFor="url">URL</InputLabel>
                      <Input
                        id="url"
                        onChange={this.onInputChange}
                        onBlur={this.onInputBlur}
                        value={this.inputStore.getInputValue('url')}
                      />
                      <FormHelperText>
                        {this.inputStore.getInputError('url') ||
                          'E.g. http://petstore.swagger.io/v2/swagger.json'}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      error={this.inputStore.getInputError('description') !== null}
                      margin="dense"
                    >
                      <InputLabel htmlFor="description">Description</InputLabel>
                      <Input
                        id="description"
                        onChange={this.onInputChange}
                        onBlur={this.onInputBlur}
                        value={this.inputStore.getInputValue('description')}
                        multiline
                        rowsMax={3}
                      />
                      <FormHelperText>
                        {this.inputStore.getInputError('description')}
                      </FormHelperText>
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button color="primary" onClick={onCloseModal} {...cancelButtonProps}>
                      Cancel
                    </Button>
                    {showSubmitProgress ? (
                      <CircularProgress size={24} className={classes.progressIndicator} />
                    ) : (
                      <Button
                        color="primary"
                        onClick={this.onSubmitSpec}
                        {...submitButtonProps}
                      />
                    )}
                  </DialogActions>
                </form>
              </Dialog>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}

export const storybook: Category<SpecModalProps> = {
  Component: SpecModal,
  stories: {
    Submit: {
      onCloseModal: () => {},
      onSubmitSpec: () => {},
      showSubmitProgress: false,
      submitButtonProps: {
        children: 'Submit',
      },
    },
  },
};
