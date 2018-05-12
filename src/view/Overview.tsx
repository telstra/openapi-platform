import AddIcon from '@material-ui/icons/Add';
import IconButton from 'material-ui/IconButton';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { ContentContainer } from 'basic/ContentContainer';
import { SimpleToolbar } from 'basic/SimpleToolbar';
import { SpecificationList } from 'basic/SpecificationList';
import { state } from 'state/SpecificationState';
import { AddSpecificationModal } from 'view/AddSpecificationModal';

/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specifications registered on the platform.
 */
export class Overview extends Component<RouteComponentProps<{}>, {}> {
  private onSearch = event => {};
  private addSpecification = () => this.props.history.push(`${this.props.match.url}/add`);
  private goToSpecification = specification =>
    this.props.history.push(`/specifications/${specification.id}`);
  private expandSpecification = id => (state.expandedSpecificationId = id);

  public render() {
    return (
      <Observer>
        {() => [
          <SimpleToolbar
            key={0}
            title="Overview"
            searchPrompt="Search specifications"
            onSearchInputChange={this.onSearch}
            actions={[
              <IconButton key={0} aria-label="add" onClick={this.addSpecification}>
                <AddIcon />
              </IconButton>,
            ]}
          />,
          <ContentContainer key={1}>
            <SpecificationList
              specifications={state.specificationList}
              expandedSpecificationId={state.expandedSpecificationId}
              // Expands/collapses a specification
              onSpecificationExpanded={this.expandSpecification}
              // Go to the specification viewing route when you select a specification
              onSpecificationSelected={this.goToSpecification}
            />
            <Route
              exact
              path={`${this.props.match.url}/add`}
              component={AddSpecificationModal}
            />
          </ContentContainer>,
        ]}
      </Observer>
    );
  }
}
