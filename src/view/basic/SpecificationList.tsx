import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import { Specification } from 'model/Specification';
import { SpecificationItem } from 'basic/SpecificationItem';
import Typography from 'material-ui/Typography';

export interface SpecificationListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: Specification[];
  onSpecificationSelected: (specification: Specification) => void;
}

/**
 * Lists a series of specifications
 */

export class SpecificationList extends Component<SpecificationListProps> {
  state = {
    expanded: null
  };

  handleChange = id => (event, expanded) => {
    this.setState({
      expanded: expanded ? id : null
    });
  };

  render() {
    const { specifications, onSpecificationSelected } = this.props;
    const { expanded } = this.state;

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
                expanded={expanded === specification.id}
                onPanelChange={this.handleChange(specification.id)}
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
