import React, { Component } from 'react';

import { Button, Typography, IconButton, TableRow, TableCell } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { action, computed, observable, toJS } from 'mobx';
import { Observer } from 'mobx-react';

import { HasId } from '@openapi-platform/model';
import {
  SdkConfig,
  BuildStatus,
  isRunning,
  PathHolder,
  Sdk,
} from '@openapi-platform/model';

import { state } from '../../state/SdkState';
import { createStyled } from '../createStyled';
import { BuildStatusChip } from './BuildStatusChip';

const Styled: any = createStyled(theme => ({
  sdkConfigItemRow: {
    '& > td': {
      border: 'none',
      padding: [0, theme.spacing.unit],
      '&:last-child': {
        paddingRight: theme.spacing.unit * 3,
      },
      '&:first-child': {
        paddingLeft: theme.spacing.unit * 3,
      },
    },
  },
  sdkConfigStatus: {
    textAlign: 'center',
  },
  // TODO: Regularly used classes like this should be defined somewhere else
  center: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

export interface SdkConfigItemProps extends React.DOMAttributes<HTMLDivElement> {
  sdkConfig: HasId<SdkConfig>;
  onEditSdkConfig: (sdkConfig: HasId<SdkConfig>) => void;
}

/**
 * Very basic information about an SDK configuration.
 * For use in lists, grids, etc.
 * TODO: Even though this claims to be a 'basic' component it manages and contains state.
 * Should really be seperated into two different components. There's also no SDK
 * state manager at the moment so that needs to change too.
 */
export class SdkConfigItem extends Component<SdkConfigItemProps> {
  /**
   * Set this to true if you want to make sure that the building status chip shows
   * a Building status instead of non-running build statuses like Fail, Success and NotRun
   */
  @observable
  private forceBuilding: boolean = false;

  constructor(props) {
    super(props);
    state.retrieveLatestSdk(this.props.sdkConfig);
  }

  @computed
  public get latestSdk() {
    const i = state.entities.values();
    let currentSdk: (Sdk & Partial<PathHolder>) | undefined = undefined;
    for (const sdk of i) {
      if (
        this.props.sdkConfig.id === sdk.sdkConfigId &&
        (!currentSdk || currentSdk.createdAt < sdk.createdAt)
      ) {
        currentSdk = sdk;
      }
    }
    return currentSdk;
  }

  @computed
  private get latestBuildStatus(): BuildStatus {
    return this.latestSdk ? this.latestSdk.buildStatus : BuildStatus.NotRun;
  }

  /**
   * This is the build status that we should show to the user.
   * The reason this exists if we want to show a build status that we know should be
   * shown, but haven't received an actual response from the server with the up-to-date
   * build status.
   */
  @computed
  private get displayedBuildStatus(): BuildStatus {
    if (this.forceBuilding && !isRunning(this.latestBuildStatus)) {
      return BuildStatus.Building;
    } else {
      return this.latestBuildStatus;
    }
  }

  @action
  private createSdk = async () => {
    this.forceBuilding = true;
    await state.createSdk(this.props.sdkConfig);
    this.forceBuilding = false;
  };

  private onEditSdkConfig = () => {
    this.props.onEditSdkConfig(this.props.sdkConfig);
  };

  public render() {
    const { sdkConfig } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <TableRow classes={{ root: classes.sdkConfigItemRow }}>
                <TableCell>
                  <Typography className={classes.sdkConfigTitle}>
                    {sdkConfig.target}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    className={classes.sdkConfigVersion}
                    variant="body1"
                    color="textSecondary"
                  >
                    {sdkConfig.version}
                  </Typography>
                </TableCell>
                <TableCell classes={{ root: classes.sdkConfigStatus }}>
                  <div className={classes.sdkConfigStatus}>
                    <BuildStatusChip buildStatus={this.displayedBuildStatus} />
                  </div>
                </TableCell>
                <TableCell numeric>
                  <div className={classes.sdkConfigActions}>
                    {this.latestSdk && this.latestSdk.fileId ? (
                      <IconButton href={this.latestSdk.fileId}>
                        <Icons.CloudDownload />
                      </IconButton>
                    ) : null}
                    <IconButton aria-label="Edit" onClick={this.onEditSdkConfig}>
                      <Icons.Edit />
                    </IconButton>
                    <Button
                      size="small"
                      disabled={isRunning(this.displayedBuildStatus)}
                      onClick={this.createSdk}
                    >
                      {isRunning(this.displayedBuildStatus) ? 'Running...' : 'Run'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}
