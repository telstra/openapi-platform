import React, { SFC } from 'react';
import { observer } from 'mobx-react';
import { state } from 'state/SpecificationState';
import { ContentContainer } from 'basic/ContentContainer';
import { SpecificationList } from 'basic/SpecificationList';
/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specications registered on the platform.
 */
export const Overview: SFC<{}> = observer(({ history, match }) => (
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
      // Closes the 'Add Specification' modal
      onAddSpecificationModalClosed={() => history.push('/')}
      // Whether or not the 'Add Specification' modal is open
      addSpecificationModalOpen={match.params.modal === 'add'}
      // Adds a specification
      onSpecificationAdded={specification => state.addSpecification(specification)}
    />
  </ContentContainer>
));
