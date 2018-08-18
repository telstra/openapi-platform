import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { state } from '../state/SpecState';
import { AddPlanModal } from './AddPlanModal';
import { AddSpecModal } from './AddSpecModal';
import { ContentContainer } from './basic/ContentContainer';
import { SimpleToolbar } from './basic/SimpleToolbar';
import { SpecList } from './basic/SpecList';

/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specs registered on the platform.
 */
export class Overview extends Component<RouteComponentProps<{}>, {}> {
  private onSearch = event => {};
  private openAddSpecModal = () => this.props.history.push(`${this.props.match.url}/add`);
  private openAddPlanModal = () =>
    this.props.history.push(`${this.props.match.url}/plan/add`);
  private goToSpec = spec => this.props.history.push(`/specs/${spec.id}`);
  private expandSpec = id => (state.expandedSpecId = id);

  public render() {
    return (
      <Observer>
        {() => [
          <SimpleToolbar
            key={0}
            title="Overview"
            searchPrompt="Search specs"
            onSearchInputChange={this.onSearch}
            actions={[
              <IconButton key={0} aria-label="add" onClick={this.openAddSpecModal}>
                <AddIcon />
              </IconButton>,
            ]}
          />,
          <ContentContainer key={1}>
            <SpecList
              specs={state.specList}
              expandedSpecId={state.expandedSpecId}
              // Expands/collapses a Spec
              onSpecExpanded={this.expandSpec}
              // Go to the Spec viewing route when you select a Spec
              onSpecSelected={this.goToSpec}
              // Open a modal to add a plan when the 'Add SDK Generation Plan' button is clicked
              onAddPlan={this.openAddPlanModal}
            />
            <Route exact path={`${this.props.match.url}/add`} component={AddSpecModal} />
            <Route
              exact
              path={`${this.props.match.url}/plan/add`}
              component={AddPlanModal}
            />
          </ContentContainer>,
        ]}
      </Observer>
    );
  }
}
