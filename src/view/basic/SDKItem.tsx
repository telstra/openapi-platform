import React, { SFC } from 'react';
import { SDK, BuildStatus } from 'model/SDK';
import Typography from 'material-ui/Typography';
import { createStyled } from 'view/createStyled';
import { BuildStatusChip } from './BuildStatusChip';
import Grid from 'material-ui/Grid';
import { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';

const Styled: any = createStyled(theme => ({
  secondary: {
    color: theme.palette.text.secondary
  }
}));

export interface SDKItemProps extends React.DOMAttributes<HTMLDivElement> {
  sdk: SDK;
}

/**
 * Very basic information about a SDK.
 * For use in lists, grids, etc.
 */

export const SDKItem: SFC<SDKItemProps> = ({ sdk }) => (
  <Styled>
    {({ classes }) => (
      <ListItem>
        <Grid container alignItems="center">
          <Grid item xs={4}>
            <ListItemText primary={sdk.name} />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1" className={classes.secondary}>
              {sdk.latestVersion}
            </Typography>
          </Grid>
          <Grid container xs={2} justify="center">
            <BuildStatusChip buildStatus={sdk.buildStatus} />
          </Grid>
          <Grid container xs={2} justify="center">
            <Button disabled={sdk.buildStatus === BuildStatus.RUNNING}>
              {sdk.buildStatus === BuildStatus.RUNNING ? 'Running...' : 'Run'}
            </Button>
          </Grid>
        </Grid>
      </ListItem>
    )}
  </Styled>
);
