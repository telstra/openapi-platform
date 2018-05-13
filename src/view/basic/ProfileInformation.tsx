import React, { SFC } from 'react';

import { Paper, Typography } from 'material-ui';

import { Profile } from 'model/Profile';
import { createStyled } from 'view/createStyled';

const Styled = createStyled(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing.unit * 2,
    boxSizing: 'border-box',
  },
}));

export interface ProfileInformationProps {
  readonly profile: Profile;
}

export const ProfileInformation: SFC<ProfileInformationProps> = ({ profile }) => (
  <Styled>
    {({ classes }) => (
      <Paper className={classes.paper}>
        <Typography variant="body1">{profile.name}</Typography>
      </Paper>
    )}
  </Styled>
);
