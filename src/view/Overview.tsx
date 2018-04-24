import React, { SFC } from 'react';
import { Route } from 'react-router-dom';
import { observer } from 'mobx-react';
import { state } from 'state/SpecificationState';
import { AddSpecificationModal } from 'view/AddSpecificationModal';
import { ContentContainer } from 'basic/ContentContainer';
import { SpecificationList } from 'basic/SpecificationList';
/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specications registered on the platform.
 */
export const Overview: SFC<{}> = observer(({ history }) => (
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
      // Opens the 'Add Specification' modal
      onAddSpecificationModalOpened={() => history.push('/add')}
    />
    <Route path="/add" component={AddSpecificationModal} />
  </ContentContainer>
));
