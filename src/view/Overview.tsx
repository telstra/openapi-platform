import React, { SFC } from 'react';
import { SpecificationList } from 'basic/SpecificationList';
import { observer } from 'mobx-react';
import { state } from 'state/SpecificationState';
import { ContentContainer } from 'basic/ContentContainer';
/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specications registered on the platform.
 */
export const Overview: SFC<{}> = observer(({ history }) => (
  <ContentContainer>
    <SpecificationList
      specifications={state.specificationList}
      // Go to the specification viewing route when you select a specification
      onSpecificationSelected={specification =>
        history.push(`/specifications/${specification.id}`)
      }
    />
  </ContentContainer>
));
