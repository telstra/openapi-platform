import { withStyles, withTheme } from 'material-ui';
/**
 * Alternative to withStyles that doesn't use HOCs
 * @see https://material-ui-next.com/customization/css-in-js/
 */
export function createStyled<T>(styles, options?: T) {
  const Styled = ({ children, ...other }) => children(other);
  return withStyles(styles, options)(Styled);
}
