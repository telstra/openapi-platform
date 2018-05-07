import React, { SFC } from 'react';
import { observer } from 'mobx-react';
import { state } from 'state/ProfileState';
import { ProfileInformation } from 'src/view/basic/ProfileInformation';
import { ContentContainer } from 'basic/ContentContainer';
import { SimpleToolbar } from 'basic/SimpleToolbar';
import IconButton from 'material-ui/IconButton';
import AddIcon from '@material-ui/icons/Add';

// TODO: Add react-router's injected props
export const ProfileViewer: SFC<any> = observer(() => (
  <div>
    <SimpleToolbar
      title="Profile"
      searchPrompt="Search profiles"
      onSearchInputChange={(input: string) => {
        console.log(input);
      }}
      actions={[
        <IconButton aria-label="add">
          <AddIcon />
        </IconButton>
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
