import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-accent-strong text-on-accent hover:bg-accent',
  secondary:
    'border border-edge-strong text-body hover:border-muted hover:text-heading',
  ghost: 'text-muted hover:bg-surface hover:text-heading',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-6 py-3 text-lg',
}

// Renders a <Link> when `to` is given, otherwise a <button>.
const Button = ({
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  ...props
}) => {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[color,background-color,border-color,transform] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) return <Link to={to} className={classes} {...props} />
  return <button type="button" className={classes} {...props} />
}

export default Button
