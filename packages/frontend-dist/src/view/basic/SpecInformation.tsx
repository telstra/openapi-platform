import React, { SFC } from 'react';

import {
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Table,
  TableBody,
} from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { Spec, SdkConfig, HasId } from '@openapi-platform/model';

import { createStyled } from '../createStyled';
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
    paddingTop: theme.spacing.unit * 2,
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
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  sdkTitleSection: {
    flexGrow: 1,
    flexShrink: 0,
  },
  sdkList: {
    borderCollapse: 'separate',
    padding: [theme.spacing.unit / 2, 0],
  },
  placeholder: {
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  specActions: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'end',
    margin: theme.spacing.unit * 2,
  },
  marginButton: {
    marginRight: theme.spacing.unit,
  },
}));

export interface SpecInformation {
  spec: HasId<Spec>;
  sdkConfigs?: Array<HasId<SdkConfig>>;
  onEditSdkConfig: (sdkConfig: HasId<SdkConfig>) => void;
  onNavigateBack: () => void;
  onAddSdkConfig: (spec: HasId<Spec>) => void;
  onEditSpec: (spec: HasId<Spec>) => void;
  onDeleteSpec: (spec: HasId<Spec>) => void;
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
  onEditSpec,
  onDeleteSpec,
  onAddSdkConfig,
}) => {
  const localOnEditSpec = () => onEditSpec(spec);
  const localOnDeleteSpec = () => onDeleteSpec(spec);
  const localOnAddSdkConfig = () => onAddSdkConfig(spec);
  return (
    <Styled>
      {({ classes }) => (
        <>
          <SimpleToolbar
            title=""
            searchPrompt="Search specs"
            onSearchInputChange={onSearch}
            actions={[]}
            showBack
            onNavigateBack={onNavigateBack}
          />
          <div className={classes.content}>
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
                </ListItem>
              </List>
            </Paper>
            <div className={classes.sdkHeader}>
              <div className={classes.sdkTitleSection}>
                <Typography variant="subheading" className={classes.indent}>
                  SDK Configurations
                </Typography>
              </div>
              {sdkConfigs ? (
                <Button variant="flat" color="primary">
                  Run all
                </Button>
              ) : null}
              <IconButton
                aria-label="Add SDK Configuration"
                onClick={localOnAddSdkConfig}
              >
                <Icons.Add />
              </IconButton>
            </div>
            {sdkConfigs ? (
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
            ) : (
              <Typography variant="body2" className={classes.placeholder}>
                No SDK Configurations
              </Typography>
            )}
            <div className={classes.specActions}>
              <Button
                className={classes.marginButton}
                variant="contained"
                color="secondary"
                onClick={localOnDeleteSpec}
              >
                Delete
              </Button>
              <Button variant="contained" color="primary" onClick={localOnEditSpec}>
                Edit
              </Button>
            </div>
          </div>
        </>
      )}
    </Styled>
  );
};
