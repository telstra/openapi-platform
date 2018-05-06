import React, { SFC } from 'react';
import { SpecificationList } from 'basic/SpecificationList';
import { observer } from 'mobx-react';
import { state } from 'state/SpecificationState';
import { ContentContainer } from 'basic/ContentContainer';
import { SimpleToolbar } from 'basic/SimpleToolbar';
import IconButton from 'material-ui/IconButton';
import AddIcon from '@material-ui/icons/Add';
/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specications registered on the platform.
 */
export const Overview: SFC<{}> = observer(({ history }) => (
  <span>
    <SimpleToolbar
      title="Overview"
      searchPrompt="Search specifications"
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
      <SpecificationList
        specifications={state.specificationList}
        expandedSpecificationId={state.expandedSpecificationId}
        // Expands/collapses a specification
        onSpecificationExpanded={id => (state.expandedSpecificationId = id)}
        // Go to the specification viewing route when you select a specification
        onSpecificationSelected={specification =>
          history.push(`/specifications/${specification.id}`)
        }
      />
    </ContentContainer>
  </span>
));
