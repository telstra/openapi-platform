import React, { SFC, SyntheticEvent } from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Modal from 'material-ui/Modal';
import { createStyled } from 'view/createStyled';
import { Specification } from 'model/Specification';

export interface AddSpecificationModalProps extends React.DOMAttributes<HTMLDivElement> {
  open: boolean;
  onClose: (event: SyntheticEvent<{}>) => void;
  onSpecificationAdded: (specification: Specification) => Promise<boolean>;
}

const Styled: any = createStyled(theme => ({
  modalPaper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    top: '50%',
    left: `50%`,
    width: `calc(100% - ${theme.spacing.unit * 4}px)`,
    maxWidth: theme.spacing.unit * 100,
    margin: `0 ${theme.spacing.unit * 2}px`,
    transform: `translate(-50%, -50%) translateX(${-theme.spacing.unit * 2}px)`
  },
  modalContent: {
    padding: theme.spacing.unit * 3
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing.unit
  }
}));

export const AddSpecificationModal: SFC<AddSpecificationModalProps> = ({
  open,
  onClose,
  onSpecificationAdded
}) => (
  <Styled>
    {({ classes }) => (
      <Modal open={open} onClose={onClose}>
        <div className={classes.modalPaper}>
          <div className={classes.modalContent}>
            <Typography variant="title">Add Specification</Typography>
            <TextField id="name" label="Name" margin="normal" />
          </div>
          <div className={classes.buttonRow}>
            <Button color="primary">Cancel</Button>
            <Button color="primary">Add</Button>
          </div>
        </div>
      </Modal>
    )}
  </Styled>
);
