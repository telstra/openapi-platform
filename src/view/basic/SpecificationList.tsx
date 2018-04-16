import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import { Specification } from 'model/Specification';
import { SpecificationItem } from 'basic/SpecificationItem';
import Typography from 'material-ui/Typography';

export interface SpecificationListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: Specification[];
  expandedSpecificationId: number | null;
  onSpecificationExpanded: (id: number | null) => void;
  onSpecificationSelected: (specification: Specification) => void;
}

/**
 * Lists a series of specifications
 */

export class SpecificationList extends Component<SpecificationListProps> {
  render() {
    const {
      specifications,
      expandedSpecificationId,
      onSpecificationExpanded,
      onSpecificationSelected
    } = this.props;

    return (
      <div>
        <Grid container justify="center">
          <Grid item xs={3} />
          <Grid item xs={6}>
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
          </Grid>
          <Grid item xs={3} />
        </Grid>
      </div>
    );
  }
}
