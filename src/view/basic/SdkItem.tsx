import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import React, { SFC } from 'react';

import { BuildStatusChip } from 'basic/BuildStatusChip';
import { Sdk, BuildStatus } from 'model/Sdk';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
  sdkItemContainer: {
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

export interface SdkItemProps extends React.DOMAttributes<HTMLDivElement> {
  sdk: Sdk;
}

/**
 * Very basic information about a SDK.
 * For use in lists, grids, etc.
 */

export const SdkItem: SFC<SdkItemProps> = ({ sdk }) => (
  <Styled>
    {({ classes }) => (
      <div className={classes.sdkItemContainer}>
        <Typography>{sdk.name}</Typography>
        <Typography variant="body1" color="textSecondary">
          {sdk.latestVersion}
        </Typography>
        <div>
          <BuildStatusChip buildStatus={sdk.buildStatus} />
        </div>
        <div>
          <Button disabled={sdk.buildStatus === BuildStatus.RUNNING}>
            {sdk.buildStatus === BuildStatus.RUNNING ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>
    )}
  </Styled>
);
