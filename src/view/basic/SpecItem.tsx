import React, { Component } from 'react';

import {
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import * as Icons from '@material-ui/icons';

import { PlanItem } from 'basic/PlanItem';
import { HasId } from 'model/Entity';
import { Plan } from 'model/Plan';
import { Spec } from 'model/Spec';
import { createStyled } from 'view/createStyled';

const Styled: any = createStyled(theme => ({
  bordered: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '2px',
  },
  indent: {
    marginLeft: theme.spacing.unit,
  },
  specSummary: {
    display: 'flex',
  },
  summarySection: {
    minWidth: 0,
  },
  summaryTitle: {
    minWidth: 0,
    flexBasis: '220px',
  },
  summaryDescription: {
    minWidth: 0,
    flexBasis: '100px',
    flexShrink: 1,
    flexGrow: 1,
  },
  detailSection: {
    flexGrow: 1,
  },
  sdkHeader: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 0,
    alignItems: 'center',
  },
  sdkTitleSection: {
    flexGrow: 1,
    flexShrink: 0,
  },
  sdkHeaderActions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
}));

export interface SpecItemProps extends React.DOMAttributes<HTMLDivElement> {
  spec: Spec;
  expanded: boolean;
  onPanelChange: (event: any, expanded: boolean) => void;
  onSpecOpen: (spec: Spec) => void;
  plans?: Array<HasId<Plan>>;
}

/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */
export class SpecItem extends Component<SpecItemProps> {
  private onChange = (event, expanded) =>
    this.props.onPanelChange(this.props.spec, expanded);

  public render() {
    const { spec, expanded, plans = [] } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <ExpansionPanel expanded={expanded} onChange={this.onChange}>
            <ExpansionPanelSummary
              classes={{ content: classes.summarySection }}
              expandIcon={expanded ? <Icons.Close /> : <Icons.InfoOutline />}
            >
              <div className={classes.summaryTitle}>
                <Typography noWrap variant={expanded ? 'title' : 'body1'}>
                  {spec.title}
                </Typography>
              </div>
              <div className={classes.summaryDescription}>
                <Typography noWrap color="textSecondary" variant="body1">
                  {!expanded && spec.description ? spec.description : ''}
                </Typography>
              </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div className={classes.detailSection}>
                <Typography className={classes.indent}>{spec.description}</Typography>
                <Typography variant="subheading" gutterBottom className={classes.indent}>
                  Specification File
                </Typography>
                <List className={classes.bordered} dense>
                  <ListItem>
                    <ListItemText primary={spec.path} />
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Edit">
                        <Icons.Edit />
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
                  {plans.map(plan => (
                    <ListItem key={plan.id}>
                      <PlanItem plan={plan} />
                    </ListItem>
                  ))}
                </List>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        )}
      </Styled>
    );
  }
}
