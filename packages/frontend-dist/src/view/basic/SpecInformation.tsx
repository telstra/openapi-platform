import React, { SFC } from 'react';

import {
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Table,
  TableBody,
} from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { Spec, SdkConfig, HasId } from '@openapi-platform/model';

import { createStyled } from '../createStyled';
import { ContentContainer } from './ContentContainer';
import { SdkConfigItem } from './SdkConfigItem';
import { SimpleToolbar } from './SimpleToolbar';

const Styled: any = createStyled(theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing.unit * 2,
    boxSizing: 'border-box',
  },
  bordered: {
    borderRadius: '2px',
    flexGrow: 1,
    padding: theme.spacing.unit / 2,
  },
  indent: {
    marginLeft: theme.spacing.unit,
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

export interface SpecInformation {
  spec: HasId<Spec>;
  sdkConfigs: Array<HasId<SdkConfig>>;
  onEditSdkConfig: (sdkConfig: HasId<SdkConfig>) => void;
  onNavigateBack: () => void;
}

const onSearch = event => {};

/**
 * Shows detailed information about a specified Spec
 */
export const SpecInformation: SFC<SpecInformation> = ({
  spec,
  sdkConfigs,
  onEditSdkConfig,
  onNavigateBack,
}) => (
  <Styled>
    {({ classes }) => [
      <SimpleToolbar
        key={0}
        title=""
        searchPrompt="Search specs"
        onSearchInputChange={onSearch}
        actions={[]}
        showBack
        onNavigateBack={onNavigateBack}
      />,
      <div className={classes.content} key={1}>
        <ContentContainer>
          <Typography variant="headline" gutterBottom>
            {spec.title}
          </Typography>
          <Typography gutterBottom className={classes.indent}>
            {spec.description}
          </Typography>
          <Typography variant="subheading" gutterBottom className={classes.indent}>
            Specification File
          </Typography>
          <Paper className={classes.bordered}>
            <List dense>
              <ListItem>
                <ListItemText primary={spec.path} />
                <ListItemSecondaryAction>
                  <IconButton aria-label="Edit">
                    <Icons.Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
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
          <Paper className={classes.bordered}>
            <Table className={classes.sdkList}>
              <TableBody>
                {sdkConfigs.map(sdk => (
                  <SdkConfigItem
                    sdkConfig={sdk}
                    key={sdk.id}
                    onEditSdkConfig={onEditSdkConfig}
                  />
                ))}
              </TableBody>
            </Table>
          </Paper>
        </ContentContainer>
      </div>,
    ]}
  </Styled>
);
