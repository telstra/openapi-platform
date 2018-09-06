import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { observer } from 'mobx-react';
import React, { SFC } from 'react';

import { state } from '../state/ProfileState';
import { ContentContainer } from './basic/ContentContainer';
import { ProfileInformation } from './basic/ProfileInformation';
import { SimpleToolbar } from './basic/SimpleToolbar';

const onSearch = event => {};

// TODO: Add react-router's injected props
export const ProfileViewer: SFC<any> = observer(() => (
  <div>
    <SimpleToolbar
      title="Profile"
      searchPrompt="Search profiles"
      onSearchInputChange={onSearch}
      actions={[
        <IconButton key={0} aria-label="add">
          <AddIcon />
        </IconButton>,
      ]}
    />
    <ContentContainer>
      {
        // Using state.me for now as example data
      }
      <ProfileInformation profile={state.me} />
    </ContentContainer>
  </div>
));
