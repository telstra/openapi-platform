import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import { Specification } from 'model/Specification';
import { SpecificationItem } from 'basic/SpecificationItem';
import Typography from 'material-ui/Typography';
import { createStyled } from 'view/createStyled';
export interface SpecificationListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: Specification[];
  expandedSpecificationId: number | null;
  onSpecificationExpanded: (id: number | null) => void;
  onSpecificationSelected: (specification: Specification) => void;
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
          <Typography variant="display1" gutterBottom>
            Overview
          </Typography>
          {specifications.map(specification => (
            <SpecificationItem
              key={specification.id}
              specification={specification}
              expanded={expandedSpecificationId === specification.id}
              onPanelChange={(event, expanded) =>
                onSpecificationExpanded(expanded ? specification.id : null)
              }
              onClick={() => onSpecificationSelected(specification)}
            />
          ))}
        </div>
      </div>
    )}
  </Styled>
);
