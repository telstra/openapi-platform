import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';
import { createStyled } from 'view/createStyled';
import Info from '@material-ui/icons/InfoOutline';
import Close from '@material-ui/icons/Close';
import Grid from 'material-ui/Grid';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Edit from '@material-ui/icons/Edit';
import { SDKItem } from './SDKItem';

const Styled: any = createStyled(theme => ({
  secondary: {
    color: theme.palette.text.secondary
  },
  block: {
    display: 'block'
  },
  bordered: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '2px'
  },
  extraGutter: {
    marginBottom: theme.spacing.unit * 2
  },
  rightButton: {
    float: 'right',
    margin: theme.spacing.unit
  },
  indent: {
    marginLeft: theme.spacing.unit
  }
}));

export interface SpecificationItemProps extends React.DOMAttributes<HTMLDivElement> {
  specification: Specification;
  expanded: boolean;
  onPanelChange: (event: any, expanded: boolean) => void;
}

/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */

export const SpecificationItem: SFC<SpecificationItemProps> = ({
  specification,
  expanded,
  onPanelChange
}) => (
  <Styled>
    {({ classes }) => (
      <ExpansionPanel expanded={expanded} onChange={onPanelChange}>
        <ExpansionPanelSummary expandIcon={expanded ? <Close /> : <Info />}>
          <Grid container>
            <Grid item xs={4}>
              <Typography variant={expanded ? 'title' : 'body1'}>
                {specification.title}
              </Typography>
            </Grid>
            <Grid item xs={4} zeroMinWidth>
              <Typography noWrap variant="body1" className={classes.secondary}>
                {!expanded && specification.description ? specification.description : ''}
              </Typography>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.block}>
          <Typography
            variant="body1"
            className={`${classes.extraGutter} ${classes.indent}`}
          >
            {specification.description || ''}
          </Typography>
          <Typography variant="subheading" gutterBottom className={classes.indent}>
            Specification File
          </Typography>
          <List className={`${classes.bordered} ${classes.extraGutter}`} dense>
            <ListItem>
              <ListItemText primary={specification.path} />
              <ListItemSecondaryAction>
                <IconButton aria-label="Edit">
                  <Edit />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          <Grid container alignItems="center">
            <Grid xs={10}>
              <Typography variant="subheading" className={classes.indent}>
                SDKs
              </Typography>
            </Grid>
            <Grid xs={2}>
              <Button variant="flat" color="primary" className={classes.rightButton}>
                Run all
              </Button>
            </Grid>
          </Grid>
          <List className={classes.bordered}>
            {specification.sdks.map(sdk => <SDKItem sdk={sdk} key={sdk.id} />)}
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )}
  </Styled>
);
