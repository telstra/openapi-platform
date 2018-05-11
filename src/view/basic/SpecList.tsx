import React, { Component } from 'react';
import { Button, Grid, Typography } from 'material-ui';

import { SpecItem } from 'basic/SpecItem';
import { HasId } from 'model/Entity';
import { Spec } from 'model/Spec';
import { state } from 'state/PlanState';
import { createStyled } from 'view/createStyled';
export interface SpecListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: HasId<Spec>[];
  expandedSpecId: number | null;
  onSpecExpanded: (id: number | null) => void;
  onSpecSelected: (specification: Spec) => void;
  onAddSpecModalOpened: () => void;
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
export const SpecList = ({
  specifications,
  expandedSpecId,
  onSpecExpanded,
  onSpecSelected
}) => (
  <Styled>
    {({ classes }) => (
      <div>
        <div className={classes.specificationSection}>
          {specifications.map(specification => (
            <SpecItem
              key={specification.id}
              specification={specification}
              expanded={expandedSpecId === specification.id}
              onPanelChange={(event, expanded) =>
                onSpecExpanded(expanded ? specification.id : null)
              }
              plans={state.specPlans.get(specification.id)}
              onClick={() => onSpecSelected(specification)}
            />
          ))}
        </div>
      </div>
    )}
  </Styled>
);
