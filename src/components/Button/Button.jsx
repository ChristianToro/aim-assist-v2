import { Link } from 'react-router-dom'

// Flat fills only: surfaces step in tone rather than drawing outlines.
// `inverse` is for buttons sitting on an accent-coloured field. `solid` is
// an app screen's one primary: ink fill, page-colour text (white on the
// dark themes, near-black on Light), keeping the accent for selection.
const variants = {
  primary: 'bg-accent-strong text-on-accent hover:bg-accent',
  solid: 'bg-heading text-bg hover:bg-body',
  secondary: 'bg-surface text-heading hover:bg-raised',
  ghost: 'text-muted hover:bg-surface hover:text-heading',
  inverse: 'bg-bg text-heading hover:bg-surface',
}

const sizes = {
  sm: 'px-3 py-1.5 text-caption',
  md: 'px-5 py-3 text-copy',
  lg: 'px-7 py-4 text-copy',
}

// Renders a <Link> when `to` is given, otherwise a <button>.
const Button = ({
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  ...props
}) => {
  const classes = `inline-flex items-center justify-center gap-2 font-medium transition-[color,background-color,border-color,transform] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) return <Link to={to} className={classes} {...props} />
  return <button type="button" className={classes} {...props} />
}

export default Button
