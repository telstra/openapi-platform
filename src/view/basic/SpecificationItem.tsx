import React, { SFC } from 'react';
import { Spec } from 'model/Spec';
import { HasId } from 'model/Entity';
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
import { SdkItem } from 'basic/SdkItem';
import { state } from 'state/SdkState';
import { Sdk } from 'model/Sdk';

const Styled: any = createStyled(theme => ({
  bordered: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '2px'
  },
  indent: {
    marginLeft: theme.spacing.unit
  },
  specSummary: {
    display: 'flex'
  },
  summarySection: {
    minWidth: 0
  },
  summaryTitle: {
    minWidth: 0,
    flexBasis: '220px'
  },
  summaryDescription: {
    minWidth: 0,
    flexBasis: '100px',
    flexShrink: 1,
    flexGrow: 1
  },
  detailSection: {
    flexGrow: 1
  },
  sdkHeader: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 0,
    alignItems: 'center'
  },
  sdkTitleSection: {
    flexGrow: 1,
    flexShrink: 0
  },
  sdkHeaderActions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
}));

export interface SpecificationItemProps extends React.DOMAttributes<HTMLDivElement> {
  specification: Spec;
  expanded: boolean;
  onPanelChange: (event: any, expanded: boolean) => void;
  sdks?: HasId<Sdk>[];
}

/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */

export const SpecificationItem: SFC<SpecificationItemProps> = ({
  specification,
  expanded,
  onPanelChange,
  sdks = []
}) => (
  <Styled>
    {({ classes }) => (
      <ExpansionPanel expanded={expanded} onChange={onPanelChange}>
        <ExpansionPanelSummary
          classes={{ content: classes.summarySection }}
          expandIcon={expanded ? <Close /> : <Info />}
        >
          <div className={classes.summaryTitle}>
            <Typography noWrap variant={expanded ? 'title' : 'body1'}>
              {specification.title}
            </Typography>
          </div>
          <div className={classes.summaryDescription}>
            <Typography noWrap color="textSecondary" variant="body1">
              {!expanded && specification.description ? specification.description : ''}
            </Typography>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className={classes.detailSection}>
            <Typography className={classes.indent}>
              {specification.description}
            </Typography>
            <Typography variant="subheading" gutterBottom className={classes.indent}>
              Specification File
            </Typography>
            <List className={classes.bordered} dense>
              <ListItem>
                <ListItemText primary={specification.path} />
                <ListItemSecondaryAction>
                  <IconButton aria-label="Edit">
                    <Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <div className={classes.sdkHeader}>
              <div className={classes.sdkTitleSection}>
                <Typography variant="subheading" className={classes.indent}>
                  SDKs
                </Typography>
              </div>
              <div className={classes.sdkHeaderActions}>
                <Button variant="flat" color="primary">
                  Run all
                </Button>
              </div>
            </div>
            <List className={classes.bordered}>
              {sdks.map(sdk => (
                <ListItem key={sdk.id}>
                  <SdkItem sdk={sdk} />
                </ListItem>
              ))}
            </List>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )}
  </Styled>
);
