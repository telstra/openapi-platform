import React, { SFC } from 'react';

import { Chip } from '@material-ui/core';
import { red, green, amber, grey, blue } from '@material-ui/core/colors';

import { BuildStatus } from '@openapi-platform/model';
import { createStyled } from '../createStyled';
const statusMap = {
  [BuildStatus.NotRun]: {
    label: 'Never run',
    color: grey[300],
  },
  [BuildStatus.Building]: {
    label: 'Building',
    color: amber[500],
  },
  [BuildStatus.Cloning]: {
    label: 'Cloning',
    color: blue[500],
  },
  [BuildStatus.Staging]: {
    label: 'Staging',
    color: blue[600],
  },
  [BuildStatus.Pushing]: {
    label: 'Pushing',
    color: blue[600],
  },
  [BuildStatus.Success]: {
    label: 'Success',
    color: green[600],
  },
  [BuildStatus.Fail]: {
    label: 'Fail',
    color: red[900],
  },
  default: {
    label: 'Unknown',
    color: grey[300],
  },
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

export const BuildStatusChip: SFC<BuildStatusChipProps> = props => {
  const valuesObj = statusMap[props.buildStatus]
    ? statusMap[props.buildStatus]
    : statusMap.default;
  return (
    <Styled buildStatusColor={valuesObj.color}>
      {({ classes }) => <Chip className={classes.root} label={valuesObj.label} />}
    </Styled>
  );
};
