import React, { SFC } from 'react';

import { Chip } from '@material-ui/core';
import { red, green, amber, grey } from '@material-ui/core/colors';

import { BuildStatus } from 'model/Plan';
import { createStyled } from 'view/createStyled';
// TODO: Should probably only have to have 1 switch case
const buildStatusToLabel = ({ buildStatus }) => {
  switch (buildStatus) {
    case BuildStatus.NOTRUN:
      return 'Never run';
    case BuildStatus.RUNNING:
      return 'Running';
    case BuildStatus.SUCCESS:
      return 'Success';
    case BuildStatus.FAIL:
      return 'Failed';
  }
};
const buildStatusToColor = ({ buildStatus }) => {
  switch (buildStatus) {
    case BuildStatus.NOTRUN:
      return grey[300];
    case BuildStatus.RUNNING:
      return amber[500];
    case BuildStatus.SUCCESS:
      return green[600];
    case BuildStatus.FAIL:
      return red[900];
  }
};
const Styled: any = createStyled(theme => ({
  root: ({ buildStatusColor }) => ({
    backgroundColor: buildStatusColor,
    color: theme.palette.getContrastText(buildStatusColor),
  }),
}));

export interface BuildStatusChipProps extends React.DOMAttributes<HTMLDivElement> {
  buildStatus: BuildStatus;
}

/**
 * Very basic information about a Spec.
 * For use in lists, grids, etc.
 */

export const BuildStatusChip: SFC<BuildStatusChipProps> = props => (
  <Styled buildStatusColor={buildStatusToColor(props)}>
    {({ classes }) => <Chip className={classes.root} label={buildStatusToLabel(props)} />}
  </Styled>
);
