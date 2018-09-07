import React, { SFC } from 'react';

import { TextField, Toolbar, Typography } from '@material-ui/core';
import * as Icons from '@material-ui/icons';

import { Category } from '../../Storybook';
import { createStyled } from '../createStyled';

export interface SimpleToolbarProps extends React.DOMAttributes<HTMLDivElement> {
  title: string;
  searchPrompt: string;
  onSearchInputChange: (event: { target: { value: string } }) => void;
  actions: any[];
}

const Styled = createStyled(theme => ({
  title: {
    flex: 1,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing.unit,
  },
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: theme.palette.background.default,
  },
  searchArea: {
    flex: '1 1 800px',
    maxWidth: '800px',
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing.unit,
    borderRadius: theme.spacing.unit / 4,
    boxSizing: 'border-box',
  },
  actions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row-reverse',
    marginLeft: theme.spacing.unit,
  },
  searchIcon: {
    color: theme.palette.text.secondary,
    margin: 'auto',
  },
  searchInput: {
    padding: `0 ${theme.spacing.unit}px`,
  },
}));

/**
 * A generic toolbar to be re-used across all main pages
 */
export const SimpleToolbar: SFC<SimpleToolbarProps> = ({
  title,
  searchPrompt,
  onSearchInputChange,
  actions,
}) => (
  <Styled>
    {({ classes }) => (
      <Toolbar className={classes.toolbar}>
        <Typography variant="title" className={classes.title}>
          {title}
        </Typography>
        <TextField
          placeholder={searchPrompt}
          className={classes.searchArea}
          InputProps={{
            disableUnderline: true,
            endAdornment: <Icons.Search className={classes.searchIcon} />,
            className: classes.searchInput,
          }}
          onChange={onSearchInputChange}
        />
        <section className={classes.actions}>{actions}</section>
      </Toolbar>
    )}
  </Styled>
);

export const storybook: Category<SimpleToolbarProps> = {
  Component: SimpleToolbar,
  stories: {
    Generic: {
      title: 'Title',
      searchPrompt: 'Search',
      onSearchInputChange: () => {},
      actions: [],
    },
  },
};
