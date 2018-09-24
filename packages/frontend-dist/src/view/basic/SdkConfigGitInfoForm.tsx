import React, { Component } from 'react';

import { FormControl, FormHelperText, Input, InputLabel } from '@material-ui/core';
import { Observer } from 'mobx-react';

import { ValidatedFormStore } from '../../ValidatedFormStore';

export interface SdkConfigGitInfoFormProps {
  inputStore: ValidatedFormStore<'repoUrl' | 'repoBranch' | 'username' | 'accessToken'>;
}

export class SdkConfigGitInfoForm extends Component<SdkConfigGitInfoFormProps> {
  private onRepoUrlChange = event =>
    this.props.inputStore.setInputValue('repoUrl', event.target.value);
  private onRepoUrlBlur = () => this.props.inputStore.updateInputError('repoUrl');
  private onRepoBranchChange = event =>
    this.props.inputStore.setInputValue('repoBranch', event.target.value);
  private onRepoBranchBlur = () => this.props.inputStore.updateInputError('repoBranch');
  private onUsernameChange = event =>
    this.props.inputStore.setInputValue('username', event.target.value);
  private onUsernameBlur = () => this.props.inputStore.updateInputError('username');
  private onAccessTokenChange = event =>
    this.props.inputStore.setInputValue('accessToken', event.target.value);
  private onAccessTokenBlur = () => this.props.inputStore.updateInputError('accessToken');

  public render() {
    const { inputStore } = this.props;
    return (
      <Observer>
        {() => (
          <>
            <FormControl
              error={inputStore.getInputError('repoUrl') !== null}
              margin="dense"
            >
              <InputLabel htmlFor="repoUrl">Repository URL</InputLabel>
              <Input
                id="repoUrl"
                onChange={this.onRepoUrlChange}
                onBlur={this.onRepoUrlBlur}
                value={inputStore.getInputValue('repoUrl')}
              />
              <FormHelperText>
                {inputStore.getInputError('repoUrl') ||
                  'E.g. https://github.com/telstra/openapi-platform.git'}
              </FormHelperText>
            </FormControl>
            <FormControl
              error={inputStore.getInputError('repoBranch') !== null}
              margin="dense"
            >
              <InputLabel htmlFor="repoBranch">Repository branch</InputLabel>
              <Input
                id="repoBranch"
                onChange={this.onRepoBranchChange}
                onBlur={this.onRepoBranchBlur}
                value={inputStore.getInputValue('repoBranch')}
              />
              <FormHelperText>
                {inputStore.getInputError('repoBranch') ||
                  'Defaults the to main branch of the repository if not provided'}
              </FormHelperText>
            </FormControl>
            <FormControl
              error={inputStore.getInputError('username') !== null}
              margin="dense"
            >
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input
                id="username"
                onChange={this.onUsernameChange}
                onBlur={this.onUsernameBlur}
                value={inputStore.getInputValue('username')}
              />
              <FormHelperText>
                {inputStore.getInputError('username') ||
                  'The username of the account to use when pushing'}
              </FormHelperText>
            </FormControl>
            <FormControl
              error={inputStore.getInputError('accessToken') !== null}
              margin="dense"
            >
              <InputLabel htmlFor="accessToken">Personal access token</InputLabel>
              <Input
                id="accessToken"
                onChange={this.onAccessTokenChange}
                onBlur={this.onAccessTokenBlur}
                value={inputStore.getInputValue('accessToken')}
              />
              <FormHelperText>
                {inputStore.getInputError('accessToken') ||
                  'A personal access token associated with the given username'}
              </FormHelperText>
            </FormControl>
          </>
        )}
      </Observer>
    );
  }
}
