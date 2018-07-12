import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { ContentContainer } from 'basic/ContentContainer';
import { SimpleToolbar } from 'basic/SimpleToolbar';
import { SpecList } from 'basic/SpecList';
import { state } from 'state/SpecState';
import { AddSpecModal } from 'view/AddSpecModal';

/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specs registered on the platform.
 */
export class Overview extends Component<RouteComponentProps<{}>, {}> {
  private onSearch = event => {};
  private addSpec = () => this.props.history.push(`${this.props.match.url}/add`);
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
              <IconButton key={0} aria-label="add" onClick={this.addSpec}>
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
            />
            <Route exact path={`${this.props.match.url}/add`} component={AddSpecModal} />
          </ContentContainer>,
        ]}
      </Observer>
    );
  }
}
