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
  @observable private latestSdkUrl?: string;

  @action
  public createSdk = async () => {
    const sdk: HasId<Sdk> = await client
      .service('sdks')
      .create({ planId: this.props.plan.id });
    // TODO: Need to get this from the actual backend
    this.props.plan.buildStatus = BuildStatus.SUCCESS;
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
                <Typography>{plan.target}</Typography>
                <Typography variant="body1" color="textSecondary">
                  {plan.version}
                </Typography>
                <div>
                  <BuildStatusChip buildStatus={plan.buildStatus} />
                </div>
                <div>
                  {this.latestSdkUrl ? (
                    <IconButton href={this.latestSdkUrl}>
                      <Icons.FileDownload />
                    </IconButton>
                  ) : null}
                  <Button
                    disabled={plan.buildStatus === BuildStatus.RUNNING}
                    onClick={this.createSdk}
                  >
                    {plan.buildStatus === BuildStatus.RUNNING ? 'Running...' : 'Run'}
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
