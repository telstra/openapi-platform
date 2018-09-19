import React, { Component } from 'react';

import {
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { Observer } from 'mobx-react';

import { SDK_CONFIG_TARGETS } from '@openapi-platform/model';
import { ValidatedFormStore } from '../../ValidatedFormStore';
import { createStyled } from '../createStyled';

const Styled: any = createStyled(theme => ({
  optionsText: {
    fontFamily: 'Roboto Mono',
  },
}));

export interface SdkConfigBasicInfoFormProps {
  inputStore: ValidatedFormStore<'target' | 'version' | 'options'>;
}

export class SdkConfigBasicInfoForm extends Component<SdkConfigBasicInfoFormProps> {
  private onTargetChange = event =>
    this.props.inputStore.setInputValue('target', event.target.value);
  private onTargetBlur = () => this.props.inputStore.updateInputError('target');
  private onVersionChange = event =>
    this.props.inputStore.setInputValue('version', event.target.value);
  private onVersionBlur = () => this.props.inputStore.updateInputError('version');
  private onOptionsChange = event =>
    this.props.inputStore.setInputValue('options', event.target.value);
  private onOptionsBlur = () => this.props.inputStore.updateInputError('options');

  public render() {
    const { inputStore } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <>
                <FormControl
                  error={inputStore.getInputError('target') !== null}
                  margin="dense"
                >
                  <InputLabel htmlFor="target">Target</InputLabel>
                  <Select
                    onChange={this.onTargetChange}
                    onBlur={this.onTargetBlur}
                    value={inputStore.getInputValue('target')}
                    inputProps={{
                      id: 'target',
                    }}
                  >
                    {SDK_CONFIG_TARGETS.map(targetName => (
                      <MenuItem key={targetName} value={targetName}>
                        {targetName}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{inputStore.getInputError('target')}</FormHelperText>
                </FormControl>
                <FormControl
                  error={inputStore.getInputError('version') !== null}
                  margin="dense"
                >
                  <InputLabel htmlFor="version">Version</InputLabel>
                  <Input
                    id="version"
                    onChange={this.onVersionChange}
                    onBlur={this.onVersionBlur}
                    value={inputStore.getInputValue('version')}
                  />
                  <FormHelperText>
                    {inputStore.getInputError('version') || 'E.g. 1.2.34'}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  error={inputStore.getInputError('options') !== null}
                  margin="dense"
                >
                  <InputLabel htmlFor="options">Options</InputLabel>
                  <Input
                    id="options"
                    className={classes.optionsText}
                    onChange={this.onOptionsChange}
                    onBlur={this.onOptionsBlur}
                    value={inputStore.getInputValue('options')}
                    multiline
                    rows={5}
                    rowsMax={10}
                  />
                  <FormHelperText>
                    {inputStore.getInputError('options') ||
                      'Target-specific options to pass to Swagger Codegen in JSON'}
                  </FormHelperText>
                </FormControl>
              </>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}
