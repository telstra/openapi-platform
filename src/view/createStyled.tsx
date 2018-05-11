import { withTheme } from 'material-ui';
import withStyles from 'react-jss';
/**
 * Alternative to withStyles that doesn't use HOCs
 * @see https://material-ui-next.com/customization/css-in-js/
 */
export function createStyled(styles, options?) {
  const Styled = ({ children, ...other }) => children(other);
  return withStyles(styles, options)(Styled);
}
