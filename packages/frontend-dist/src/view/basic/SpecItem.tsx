import React, { Component } from 'react';

import {
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
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
  onEditSpec: (spec: HasId<Spec>) => void;
  onDeleteSpec: (spec: HasId<Spec>) => void;
  onAddSdkConfig: (spec: HasId<Spec>) => void;
  onSpecOpen: (id: Id | null) => void;
  sdkConfigs?: Array<HasId<SdkConfig>>;
  onEditSdkConfig: (sdkConfig: HasId<SdkConfig>) => void;
}

/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */
export class SpecItem extends Component<SpecItemProps> {
  private onChange = (event, expanded) =>
    this.props.onPanelChange(this.props.spec, expanded);
  private specOpen = () => this.props.onSpecOpen(this.props.spec.id);

  private onEditSpec = () => this.props.onEditSpec(this.props.spec);

  private onDeleteSpec = () => this.props.onDeleteSpec(this.props.spec);

  private onAddSdkConfig = () => this.props.onAddSdkConfig(this.props.spec);

  public render() {
    const { spec, expanded, sdkConfigs = [], onEditSdkConfig } = this.props;
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
                  </ListItem>
                </List>
                <div className={classes.sdkHeader}>
                  <div className={classes.sdkTitleSection}>
                    <Typography variant="subheading" className={classes.indent}>
                      SDK Configurations
                    </Typography>
                  </div>
                  <div className={classes.sdkHeaderActions}>
                    <Button variant="flat" color="primary" size="small">
                      Run all
                    </Button>
                    <IconButton
                      aria-label="Add SDK Configuration"
                      onClick={this.onAddSdkConfig}
                    >
                      <Icons.Add />
                    </IconButton>
                  </div>
                </div>
                <Table classes={{ root: classNames(classes.sdkList, classes.bordered) }}>
                  <TableBody>
                    {sdkConfigs.map(sdkConfig => (
                      <SdkConfigItem
                        key={sdkConfig.id}
                        sdkConfig={sdkConfig}
                        onEditSdkConfig={onEditSdkConfig}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ExpansionPanelDetails>
            <Divider />
            <ExpansionPanelActions>
              <Button color="secondary" onClick={this.onDeleteSpec}>
                Delete
              </Button>
              <Button color="primary" onClick={this.onEditSpec}>
                Edit
              </Button>
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
