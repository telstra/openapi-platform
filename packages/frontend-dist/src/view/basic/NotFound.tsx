import React, { SFC } from 'react';

import { Typography } from '@material-ui/core';

import { createStyled } from '../createStyled';
import { ContentContainer } from './ContentContainer';

const Styled: any = createStyled(theme => ({
  container: {
    maxWidth: '800px',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: {
    background: theme.overrides.MuiDrawer.paper.background,
    clipPath: 'url(#svgPath)',
    width: 144,
    height: 176,
    marginBottom: theme.spacing.unit * 6,
    marginTop: theme.spacing.unit * 4,
  },
}));

const images = {
  cake: (
    <svg height="0" width="0">
      <defs>
        <clipPath id="svgPath">
          <path d="M72,48 C80.88,48 88,40.8 88,32 C88,28.96 87.2,26.16 85.68,23.76 L72,0 L58.32,23.76 C56.8,26.16 56,28.96 56,32 C56,40.8 63.2,48 72,48 Z M108.8,127.92 L100.24,119.36 L91.6,127.92 C81.2,138.32 62.96,138.4 52.48,127.92 L43.92,119.36 L35.2,127.92 C30,133.12 23.04,136 15.68,136 C9.84,136 4.48,134.16 0,131.12 L0,168 C0,172.4 3.6,176 8,176 L136,176 C140.4,176 144,172.4 144,168 L144,131.12 C139.52,134.16 134.16,136 128.32,136 C120.96,136 114,133.12 108.8,127.92 Z M120,72 L80,72 L80,56 L64,56 L64,72 L24,72 C10.72,72 0,82.72 0,96 L0,108.32 C0,116.96 7.04,124 15.68,124 C19.84,124 23.84,122.4 26.72,119.44 L43.84,102.4 L60.88,119.44 C66.8,125.36 77.12,125.36 83.04,119.44 L100.16,102.4 L117.2,119.44 C120.16,122.4 124.08,124 128.24,124 C136.88,124 143.92,116.96 143.92,108.32 L143.92,96 C144,82.72 133.28,72 120,72 Z" />
        </clipPath>
      </defs>
    </svg>
  ),
};

export interface NotFound {
  image?: string;
  item?: string;
}

export const NotFound: SFC<NotFound> = ({ image, item }) => (
  <Styled>
    {({ classes }) => (
      <ContentContainer>
        <div className={classes.container}>
          {image ? images[image] : images.cake}
          <div className={classes.image} />
          <Typography variant="headline" gutterBottom>{`We're sorry, we ${
            item ? "couldn't find that " + item : "can't find anything here"
          }`}</Typography>
          <Typography variant="subheading">Here's some cake instead</Typography>
        </div>
      </ContentContainer>
    )}
  </Styled>
);
