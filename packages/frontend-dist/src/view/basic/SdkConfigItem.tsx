import React, { Component } from 'react';

import { Button, Typography, IconButton, TableRow, TableCell } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';

import { HasId } from '@openapi-platform/model';
import { SdkConfig, BuildStatus, isRunning } from '@openapi-platform/model';
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
  onEditSdkConfig: (sdkConfig: HasId<SdkConfig>) => void;
}

/**
 * Very basic information about an SDK configuration.
 * For use in lists, grids, etc.
 */
export class SdkConfigItem extends Component<SdkConfigItemProps> {
  // This is the download path to the most recently created SDK for this config.
  @observable
  private latestSdkUrl?: string;

  /**
   * TODO: Not really sure when this got approved but this method really shouldn't be inside of a
   * basic component.
   */
  @action
  public createSdk = async () => {
    // TODO: Little hacky changing modifying one's own props
    this.props.sdkConfig.buildStatus = BuildStatus.Building;
    try {
      const sdk: HasId<Sdk> = await client
        .service('sdks')
        .create({ sdkConfigId: this.props.sdkConfig.id });

      // Errors from building a SDK via the open API call will result in sdk.buildStatus === FAIL.
      // sdk.buildError will contain the error message.
      this.props.sdkConfig.buildStatus = sdk.buildStatus;
      this.latestSdkUrl = sdk.path;
    } catch (err) {
      // Catches errors apart from the open API call to build the SDK.
      this.props.sdkConfig.buildStatus = BuildStatus.Fail;
    }
  };

  private onEditSdkConfig = () => {
    this.props.onEditSdkConfig(this.props.sdkConfig);
  };

  private getLatestSdk = async (sdkConfig: HasId<SdkConfig>) => {
    const sdks: Sdk[] = await client.service('sdks').find({
      query: {
        $limit: 1,
        $sort: {
          createdAt: -1,
        },
        sdkConfigId: sdkConfig.id,
      },
    });
    this.latestSdkUrl = sdks.length > 0 ? sdks[0].path : '';
  };

  public componentDidMount() {
    const { sdkConfig } = this.props;
    this.getLatestSdk(sdkConfig);
  }

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
                    <IconButton aria-label="Edit" onClick={this.onEditSdkConfig}>
                      <Icons.Edit />
                    </IconButton>
                    <Button
                      size="small"
                      disabled={isRunning(sdkConfig.buildStatus)}
                      onClick={this.createSdk}
                    >
                      {isRunning(sdkConfig.buildStatus) ? 'Running...' : 'Run'}
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
