import React, { SFC } from 'react';
import { Plan, BuildStatus } from 'model/Plan';
import Typography from 'material-ui/Typography';
import { createStyled } from 'view/createStyled';
import { BuildStatusChip } from 'basic/BuildStatusChip';
import Grid from 'material-ui/Grid';
import { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';

const Styled: any = createStyled(theme => ({
  PlanItemContainer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > *:not(:first-child)': {
      marginLeft: theme.spacing.unit
    }
  },
  // TODO: Regularly used classes like this should be defined somewhere else
  center: {
    marginLeft: 'auto',
    marginRight: 'auto'
  }
}));

export interface PlanItemProps extends React.DOMAttributes<HTMLDivElement> {
  plan: Plan;
}

/**
 * Very basic information about a SDK.
 * For use in lists, grids, etc.
 */

export const PlanItem: SFC<PlanItemProps> = ({ plan }) => (
  <Styled>
    {({ classes }) => (
      <div className={classes.sdkItemContainer}>
        <Typography>{plan.name}</Typography>
        <Typography variant="body1" color="textSecondary">
          {plan.latestVersion}
        </Typography>
        <div>
          <BuildStatusChip buildStatus={plan.buildStatus} />
        </div>
        <div>
          <Button disabled={plan.buildStatus === BuildStatus.RUNNING}>
            {plan.buildStatus === BuildStatus.RUNNING ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>
    )}
  </Styled>
);
