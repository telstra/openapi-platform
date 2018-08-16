import React, { Component } from 'react';

import { Button, Typography, IconButton } from '@material-ui/core';
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
  planItemContainer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > *:not(:first-child)': {
      marginLeft: theme.spacing.unit,
    },
    '& > *': {
      flexBasis: 0,
    },
  },
  planTitle: {
    flexGrow: 6,
  },
  planVersion: {
    flexGrow: 3,
  },
  planStatus: {
    flexGrow: 3,
    textAlign: 'center',
  },
  planActions: {
    flexGrow: 4,
    textAlign: 'right',
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
              <div className={classes.planItemContainer}>
                <Typography className={classes.planTitle}>{plan.target}</Typography>
                <Typography
                  className={classes.planVersion}
                  variant="body1"
                  color="textSecondary"
                >
                  {plan.version}
                </Typography>
                <div className={classes.planStatus}>
                  <BuildStatusChip buildStatus={plan.buildStatus} />
                </div>
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
              </div>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}
