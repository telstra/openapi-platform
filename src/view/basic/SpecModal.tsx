import React from 'react';

import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography,
} from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { ModalProps } from '@material-ui/core/Modal';
import { Observer } from 'mobx-react';

import { FloatingModal } from 'basic/FloatingModal';
import {
  ValidatedForm,
  inputValid,
  inputInvalid,
  alwaysValid,
} from 'basic/ValidatedForm';
import { Category } from 'model/Storybook';
import { AddedSpec } from 'state/SpecState';
import { isWebUri } from 'valid-url';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
  modalPaper: {
    maxWidth: theme.spacing.unit * 64,
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

export type OnCloseModal = () => void;
export type OnSubmitSpec = (spec: AddedSpec) => void;
export interface SpecModalProps {
  readonly onCloseModal: OnCloseModal;
  readonly onSubmitSpec: OnSubmitSpec;
  readonly cancelButtonProps?: ButtonProps;
  readonly submitButtonProps?: ButtonProps;
  readonly showSubmitProgress?: boolean;
  readonly modalProps?: ModalProps;
}

type SpecModalInput = 'title' | 'url' | 'description';

/**
 * A modal window that allows the user to add a Spec to the dashboard.
 * Currently only supports specifying a name and URL.
 */
export class SpecModal extends ValidatedForm<SpecModalInput, SpecModalProps> {
  constructor(props: Readonly<SpecModalProps>) {
    super(
      {
        title: {
          validation: title =>
            !title ? inputInvalid('Error: Missing title') : inputValid(),
          initialValue: '',
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
          initialValue: '',
        },
        description: {
          validation: alwaysValid,
          initialValue: '',
        },
      },
      props,
    );
  }

  /**
   * Event fired when the user presses the 'Add' button.
   */
  private onSubmitSpec = () => {
    // Validate input
    if (!this.inputsValid) {
      this.updateAllInputErrors();
      return;
    }

    // Send the request to the backend
    const title = this.getInputValue('title');
    const path = isWebUri(this.getInputValue('url'));
    const description = this.getInputValue('description');
    this.props.onSubmitSpec({ title, path, description });
  };

  private onInputChange = event =>
    this.setInputValue(event.target.id as SpecModalInput, event.target.value);
  private onInputBlur = event => this.updateInputError(event.target.id as SpecModalInput);

  private onAddButtonClick = event => {
    event.preventDefault();
    this.onSubmitSpec();
  };

  public render() {
    const {
      onCloseModal,
      modalProps,
      cancelButtonProps,
      showSubmitProgress,
      submitButtonProps,
    } = this.props;

    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <FloatingModal
                key={0}
                classes={{ paper: classes.modalPaper }}
                open
                onClose={onCloseModal}
                {...modalProps}
              >
                <form>
                  <div className={classes.modalContent}>
                    <Typography variant="title" className={classes.title}>
                      Add Swagger Spec
                    </Typography>
                    <FormControl
                      error={this.getInputError('title') !== null}
                      margin="normal"
                    >
                      <InputLabel htmlFor="title">Title</InputLabel>
                      <Input
                        id="title"
                        onChange={this.onInputChange}
                        onBlur={this.onInputBlur}
                        value={this.getInputValue('title')}
                      />
                      <FormHelperText>
                        {this.getInputError('title') || 'E.g. Petstore'}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      error={this.getInputError('url') !== null}
                      margin="dense"
                    >
                      <InputLabel htmlFor="url">URL</InputLabel>
                      <Input
                        id="url"
                        onChange={this.onInputChange}
                        onBlur={this.onInputBlur}
                        value={this.getInputValue('url')}
                      />
                      <FormHelperText>
                        {this.getInputError('url') ||
                          'E.g. http://petstore.swagger.io/v2/swagger.json'}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      error={this.getInputError('description') !== null}
                      margin="dense"
                    >
                      <InputLabel htmlFor="description">Description</InputLabel>
                      <Input
                        id="description"
                        onChange={this.onInputChange}
                        onBlur={this.onInputBlur}
                        value={this.getInputValue('description')}
                        multiline
                        rowsMax={3}
                      />
                      <FormHelperText>{this.getInputError('description')}</FormHelperText>
                    </FormControl>
                  </div>

                  <div className={classes.buttonRow}>
                    <Button
                      color="primary"
                      type="button"
                      onClick={onCloseModal}
                      {...cancelButtonProps}
                    >
                      Cancel
                    </Button>
                    {showSubmitProgress ? (
                      <CircularProgress size={24} className={classes.progressIndicator} />
                    ) : (
                      <Button
                        color="primary"
                        type="submit"
                        onClick={this.onAddButtonClick}
                        {...submitButtonProps}
                      />
                    )}
                  </div>
                </form>
              </FloatingModal>
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
