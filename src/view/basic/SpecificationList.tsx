import React, { Component } from 'react';
import { Button, Grid, Typography } from 'material-ui';

import { SpecificationItem } from 'basic/SpecificationItem';
import { HasId } from 'model/Entity';
import { Spec } from 'model/Spec';
import { state } from 'state/SdkState';
import { createStyled } from 'view/createStyled';
export interface SpecificationListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: HasId<Spec>[];
  expandedSpecificationId: number | null;
  onSpecificationExpanded: (id: number | null) => void;
  onSpecificationSelected: (specification: Spec) => void;
  onAddSpecificationModalOpened: () => void;
}

const Styled = createStyled(theme => ({
  specificationSection: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
}));

/**
 * Lists a series of specifications
 */
export const SpecificationList = ({
  specifications,
  expandedSpecificationId,
  onSpecificationExpanded,
  onSpecificationSelected
}) => (
  <Styled>
    {({ classes }) => (
      <div>
        <div className={classes.specificationSection}>
          {specifications.map(specification => (
            <SpecificationItem
              key={specification.id}
              specification={specification}
              expanded={expandedSpecificationId === specification.id}
              onPanelChange={(event, expanded) =>
                onSpecificationExpanded(expanded ? specification.id : null)
              }
              sdks={state.specSdks.get(specification.id)}
              onClick={() => onSpecificationSelected(specification)}
            />
          ))}
        </div>
      </div>
    )}
  </Styled>
);
