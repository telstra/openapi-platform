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
  ExpansionPanelActions,
  Table,
  TableBody,
  Divider,
} from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import classNames from 'classnames';

import { HasId, SdkConfig, Spec, Id } from '@openapi-platform/model';
import { createStyled } from '../createStyled';
import { SdkConfigItem } from './SdkConfigItem';

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
  summaryTitleExpanded: {
    minWidth: 0,
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
  sdkList: {
    borderCollapse: 'separate',
    padding: [theme.spacing.unit / 2, 0],
  },
}));

export interface SpecItemProps extends React.DOMAttributes<HTMLDivElement> {
  spec: HasId<Spec>;
  expanded: boolean;
  onPanelChange: (event: any, expanded: boolean) => void;
  onSpecOpen: (id: Id | null) => void;
  onAddSdkConfig: (event: any) => void | undefined;
  sdkConfigs?: Array<HasId<SdkConfig>>;
}

/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */
export class SpecItem extends Component<SpecItemProps> {
  private onChange = (event, expanded) =>
    this.props.onPanelChange(this.props.spec, expanded);
  private specOpen = () => this.props.onSpecOpen(this.props.spec.id);

  public render() {
    const { spec, expanded, onAddSdkConfig, sdkConfigs = [] } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <ExpansionPanel expanded={expanded} onChange={this.onChange}>
            <ExpansionPanelSummary
              classes={{ content: classes.summarySection }}
              expandIcon={expanded ? <Icons.Close /> : <Icons.InfoOutlined />}
            >
              <div
                className={expanded ? classes.summaryTitleExpanded : classes.summaryTitle}
              >
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
                <Typography className={classes.indent} gutterBottom>
                  {spec.description}
                </Typography>
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
                      SDK Configurations
                    </Typography>
                  </div>
                  <div className={classes.sdkHeaderActions}>
                    <Button variant="flat" color="primary">
                      Run all
                    </Button>
                  </div>
                </div>
                <Table classes={{ root: classNames(classes.sdkList, classes.bordered) }}>
                  <TableBody>
                    {sdkConfigs.map(sdkConfig => (
                      <SdkConfigItem key={sdkConfig.id} sdkConfig={sdkConfig} />
                    ))}
                  </TableBody>
                </Table>
                <List>
                  <ListItem className={classes.sdkHeaderActions}>
                    <ListItemSecondaryAction>
                      <Button variant="flat" color="primary" onClick={onAddSdkConfig}>
                        Add SDK Configuration
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </div>
            </ExpansionPanelDetails>
            <Divider />
            <ExpansionPanelActions>
              <Button color="primary" onClick={this.specOpen}>
                Open
              </Button>
            </ExpansionPanelActions>
          </ExpansionPanel>
        )}
      </Styled>
    );
  }
}
