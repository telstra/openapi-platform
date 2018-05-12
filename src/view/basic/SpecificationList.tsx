import React, { Component } from 'react';

import { SpecificationItem } from 'basic/SpecificationItem';
import { Specification } from 'model/Specification';
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
export class SpecificationList extends Component<SpecificationListProps, {}> {
  private panelExpand = (specification, expanded) =>
    this.props.onSpecificationExpanded(expanded ? specification.id : null);

  public render() {
    const {
      specifications,
      expandedSpecificationId,
      onSpecificationSelected
    } = this.props;

    return (
      <Styled>
        {({ classes }) => (
          <div>
            <div className={classes.specificationSection}>
              {specifications.map(specification => (
                <SpecificationItem
                  key={specification.id}
                  specification={specification}
                  expanded={expandedSpecificationId === specification.id}
                  onPanelChange={this.panelExpand}
                  onSpecifiationOpen={onSpecificationSelected}
                />
              ))}
            </div>
          </div>
        )}
      </Styled>
    );
  }
}
