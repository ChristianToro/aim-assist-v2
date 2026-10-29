// The chosen label carries the app's one selection mark: a 1px accent line
// exactly as wide as the label, laid over the tab row's rule.
const tabClass = (isActive) =>
  `-mb-px border-b py-2 text-ui font-medium whitespace-nowrap transition-colors ${
    isActive
      ? 'border-accent text-heading'
      : 'border-transparent text-muted hover:text-heading'
  }`

/*
 * Underline tabs on one full-width rule. The row wraps rather than
 * scrolling sideways, so on a phone no tab can sit off-screen behind a
 * scrollbar the visitor never sees. `tabId` and `panelId` wire each tab
 * to the panel it controls.
 */
const Tabs = ({
  items,
  selectedId,
  onSelect,
  label,
  panelId,
  tabId = () => undefined,
  className = '',
}) => (
  <div
    role="tablist"
    aria-label={label}
    className={`flex flex-wrap gap-x-6 border-b border-edge ${className}`}
  >
    {items.map(({ id, label: tabLabel }) => (
      <button
        key={id}
        id={tabId(id)}
        type="button"
        role="tab"
        aria-selected={selectedId === id}
        aria-controls={panelId}
        className={tabClass(selectedId === id)}
        onClick={() => onSelect(id)}
      >
        {tabLabel}
      </button>
    ))}
  </div>
)

export default Tabs
