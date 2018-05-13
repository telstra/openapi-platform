import AddIcon from '@material-ui/icons/Add';
import IconButton from 'material-ui/IconButton';
import { observer } from 'mobx-react';
import React, { SFC } from 'react';

import { ContentContainer } from 'basic/ContentContainer';
import { ProfileInformation } from 'basic/ProfileInformation';
import { SimpleToolbar } from 'basic/SimpleToolbar';
import { state } from 'state/ProfileState';

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
