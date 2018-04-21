import React, { SFC } from 'react';
import { BuildStatus } from 'model/Sdk';
import red from 'material-ui/colors/red';
import green from 'material-ui/colors/green';
import amber from 'material-ui/colors/amber';
import grey from 'material-ui/colors/grey';
import { createStyled } from 'view/createStyled';
import Chip from 'material-ui/Chip';

const colorStatusArray = [grey[300], amber[500], green[600], red[900]];
const statusStringArray = ['Never run', 'Running', 'Success', 'Failed'];

export interface BuildStatusChipProps extends React.DOMAttributes<HTMLDivElement> {
  buildStatus: BuildStatus;
}

/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */

export const BuildStatusChip: SFC<BuildStatusChipProps> = ({ buildStatus }) => {
  const Styled: any = createStyled(theme => ({
    root: {
      backgroundColor: colorStatusArray[buildStatus],
      color: theme.palette.getContrastText(colorStatusArray[buildStatus])
    }
  }));
  return (
    <Styled>
      {({ classes }) => (
        <Chip className={classes.root} label={statusStringArray[buildStatus]} />
      )}
    </Styled>
  );
};
