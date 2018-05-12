import React, { ComponentType } from 'react';

import { createStyled } from 'view/createStyled';

const Styled = createStyled(theme => ({
  content: {
    padding: theme.spacing.unit * 2,
  },
}));

export const ContentContainer: ComponentType<{}> = ({ children }) => (
  <Styled>{({ classes }) => <div className={classes.content}>{children}</div>}</Styled>
);
