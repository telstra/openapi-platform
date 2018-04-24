import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import { Specification } from 'model/Specification';
import { createStyled } from 'view/createStyled';
import { AddSpecificationModal } from 'basic/AddSpecificationModal';
import { SpecificationItem } from 'basic/SpecificationItem';

export interface SpecificationListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: Specification[];
  expandedSpecificationId: number | null;
  onSpecificationExpanded: (id: number | null) => void;
  onSpecificationSelected: (specification: Specification) => void;
  onAddSpecificationModalOpened: () => void;
  onAddSpecificationModalClosed: () => void;
  addSpecificationModalOpen: boolean;
  onSpecificationAdded: (specification: Specification) => Promise<boolean>;
}

const Styled = createStyled(theme => ({
  specificationSection: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.unit * 2
  }
}));

/**
 * Lists a series of specifications
 */
export const SpecificationList = ({
  specifications,
  expandedSpecificationId,
  onSpecificationExpanded,
  onSpecificationSelected,
  onAddSpecificationModalOpened,
  onAddSpecificationModalClosed,
  addSpecificationModalOpen,
  onSpecificationAdded
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
          <Button
            variant="raised"
            color="primary"
            className={classes.addButton}
            onClick={() => onAddSpecificationModalOpened()}
          >
            Add Specification
          </Button>
        </div>
        <AddSpecificationModal
          open={addSpecificationModalOpen}
          onClose={onAddSpecificationModalClosed}
          onSpecificationAdded={onSpecificationAdded}
        />
      </div>
    )}
  </Styled>
);
