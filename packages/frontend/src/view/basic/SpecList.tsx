import React, { Component } from 'react';

import { Observer } from 'mobx-react';

import { SpecItem } from './SpecItem';
import { HasId, Spec } from '@openapi-platform/model';
import { state } from '../../state/PlanState';
import { createStyled } from '../createStyled';
export interface SpecListProps extends React.DOMAttributes<HTMLDivElement> {
  specs: Array<HasId<Spec>>;
  expandedSpecId: number | null;
  onSpecExpanded: (id: number | null) => void;
  onSpecSelected: (Spec: Spec) => void;
  onAddPlan: () => void;
}

const Styled = createStyled(theme => ({
  specSection: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

/**
 * Lists a series of specs
 */
export class SpecList extends Component<SpecListProps, {}> {
  private panelExpand = (specification, expanded) =>
    this.props.onSpecExpanded(expanded ? specification.id : null);

  public render() {
    const { expandedSpecId, onAddPlan, onSpecSelected, specs } = this.props;
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <div>
                <div className={classes.specSection}>
                  {specs.map(spec => (
                    <SpecItem
                      key={spec.id}
                      spec={spec}
                      plans={state.specPlans.get(spec.id)}
                      expanded={expandedSpecId === spec.id}
                      onPanelChange={this.panelExpand}
                      onSpecOpen={onSpecSelected}
                      onAddPlan={onAddPlan}
                    />
                  ))}
                </div>
              </div>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}
