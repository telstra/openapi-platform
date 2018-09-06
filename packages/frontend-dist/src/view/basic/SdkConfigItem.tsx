import React, { Component } from 'react';

import { Button, Typography, IconButton, TableRow, TableCell } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';

import { HasId } from '@openapi-platform/model';
import { SdkConfig, BuildStatus } from '@openapi-platform/model';
import { Sdk } from '@openapi-platform/model';
import { client } from '../../client';
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
}

/**
 * Very basic information about an SDK configuration.
 * For use in lists, grids, etc.
 */
export class SdkConfigItem extends Component<SdkConfigItemProps> {
  @observable
  private latestSdkUrl?: string;

  @action
  public createSdk = async () => {
    const sdk: HasId<Sdk> = await client
      .service('sdks')
      .create({ sdkConfigId: this.props.sdkConfig.id });
    // TODO: Need to get this from the actual backend
    this.props.sdkConfig.buildStatus = BuildStatus.Success;
    this.latestSdkUrl = sdk.path;
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
                    <BuildStatusChip buildStatus={sdkConfig.buildStatus} />
                  </div>
                </TableCell>
                <TableCell numeric>
                  <div className={classes.sdkConfigActions}>
                    {this.latestSdkUrl ? (
                      <IconButton href={this.latestSdkUrl}>
                        <Icons.CloudDownload />
                      </IconButton>
                    ) : null}
                    <Button
                      disabled={sdkConfig.buildStatus === BuildStatus.Running}
                      onClick={this.createSdk}
                    >
                      {sdkConfig.buildStatus === BuildStatus.Running
                        ? 'Running...'
                        : 'Run'}
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
