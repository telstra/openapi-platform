import React, { SFC } from 'react';
import { Route } from 'react-router-dom';
import { observer } from 'mobx-react';
import IconButton from 'material-ui/IconButton';
import AddIcon from '@material-ui/icons/Add';

import { state } from 'state/SpecificationState';
import { AddSpecificationModal } from 'view/AddSpecificationModal';
import { ContentContainer } from 'basic/ContentContainer';
import { SimpleToolbar } from 'basic/SimpleToolbar';
import { SpecificationList } from 'basic/SpecificationList';

/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specifications registered on the platform.
 */
export const Overview: SFC<{}> = observer(({ history, match }) => (
  <div>
    <SimpleToolbar
      title="Overview"
      searchPrompt="Search specifications"
      onSearchInputChange={(input: string) => {
        console.log(input);
      }}
      actions={[
        <IconButton aria-label="add" onClick={() => history.push(`${match.url}/add`)}>
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
      <Route exact path={`${match.url}/add`} component={AddSpecificationModal} />
    </ContentContainer>
  </div>
));
