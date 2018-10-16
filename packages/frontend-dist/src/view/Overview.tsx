import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import { Observer } from 'mobx-react';
import React, { Component, ReactNode } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { Id } from '@openapi-platform/model';
import { state } from '../state/SpecState';
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
  private expandSpec = (id: Id | null) =>
    this.props.history.push(`${this.props.match.url}${id === null ? '' : '/' + id}`);
  private onSpecOpen = (id: Id) => this.props.history.push(`/specs/${id}`);

  private renderSpecList: (
    props: RouteComponentProps<{ specId?: string }>,
  ) => ReactNode = ({ match, ...rest }) => (
    <Observer>
      {() => (
        <SpecList
          specs={state.specList}
          expandedSpecId={
            match && match.params.specId ? parseInt(match.params.specId, 10) : null
          }
          // Expands/collapses a Spec
          onSpecExpanded={this.expandSpec}
          onSpecOpen={this.onSpecOpen}
        />
      )}
    </Observer>
  );

  public render() {
    return (
      <Observer>
        {() => (
          <>
            <SimpleToolbar
              title="Overview"
              searchPrompt="Search specs"
              onSearchInputChange={this.onSearch}
              actions={[
                <IconButton key={0} aria-label="add" onClick={this.openAddSpecModal}>
                  <AddIcon />
                </IconButton>,
              ]}
            />
            <ContentContainer>
              <Route
                path={`${this.props.match.url}/:specId(\\d+)`}
                children={this.renderSpecList}
              />
              <Route
                exact
                path={`${this.props.match.url}/add`}
                component={AddSpecModal}
              />
            </ContentContainer>
          </>
        )}
      </Observer>
    );
  }
}
