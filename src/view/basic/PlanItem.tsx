import React, { Component } from 'react';

import { Button, Typography, IconButton, TableRow, TableCell } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react';

import { BuildStatusChip } from 'basic/BuildStatusChip';
import { client } from 'client/BackendClient';
import { HasId } from 'model/Entity';
import { Plan, BuildStatus } from 'model/Plan';
import { Sdk } from 'model/Sdk';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
  planItemRow: {
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
  planStatus: {
    textAlign: 'center',
  },
  // TODO: Regularly used classes like this should be defined somewhere else
  center: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

export interface PlanItemProps extends React.DOMAttributes<HTMLDivElement> {
  plan: HasId<Plan>;
}

/**
 * Very basic information about a SDK.
 * For use in lists, grids, etc.
 */
export class PlanItem extends Component<PlanItemProps> {
  @observable
  private latestSdkUrl?: string;

  @action
  public createSdk = async () => {
    const sdk: HasId<Sdk> = await client
      .service('sdks')
      .create({ planId: this.props.plan.id });
    // TODO: Need to get this from the actual backend
    this.props.plan.buildStatus = BuildStatus.Success;
    this.latestSdkUrl = sdk.path;
  };

  public render() {
    const { plan } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <TableRow classes={{ root: classes.planItemRow }}>
                <TableCell>
                  <Typography className={classes.planTitle}>{plan.target}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    className={classes.planVersion}
                    variant="body1"
                    color="textSecondary"
                  >
                    {plan.version}
                  </Typography>
                </TableCell>
                <TableCell classes={{ root: classes.planStatus }}>
                  <div className={classes.planStatus}>
                    <BuildStatusChip buildStatus={plan.buildStatus} />
                  </div>
                </TableCell>
                <TableCell numeric>
                  <div className={classes.planActions}>
                    {this.latestSdkUrl ? (
                      <IconButton href={this.latestSdkUrl}>
                        <Icons.CloudDownload />
                      </IconButton>
                    ) : null}
                    <Button
                      disabled={plan.buildStatus === BuildStatus.Running}
                      onClick={this.createSdk}
                    >
                      {plan.buildStatus === BuildStatus.Running ? 'Running...' : 'Run'}
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
