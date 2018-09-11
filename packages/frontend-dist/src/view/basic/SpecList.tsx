import React, { Component } from 'react';

import { Observer } from 'mobx-react';

import { Id, HasId, Spec, SdkConfig } from '@openapi-platform/model';
import { state } from '../../state/SdkConfigState';
import { createStyled } from '../createStyled';
import { SpecItem } from './SpecItem';
export interface SpecListProps extends React.DOMAttributes<HTMLDivElement> {
  specs: Array<HasId<Spec>>;
  expandedSpecId: number | null;
  onSpecExpanded: (id: Id | null) => void;
  onEditSpec: (spec: HasId<Spec>) => void;
  onAddSdkConfig: (spec: HasId<Spec>) => void;
  onEditSdkConfig: (sdkConfig: HasId<SdkConfig>) => void;
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
    const {
      expandedSpecId,
      onEditSpec,
      onAddSdkConfig,
      specs,
      onEditSdkConfig,
    } = this.props;
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
                      sdkConfigs={state.specSdkConfigs.get(spec.id)}
                      expanded={expandedSpecId === spec.id}
                      onPanelChange={this.panelExpand}
                      onEditSpec={onEditSpec}
                      onAddSdkConfig={onAddSdkConfig}
                      onEditSdkConfig={onEditSdkConfig}
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
