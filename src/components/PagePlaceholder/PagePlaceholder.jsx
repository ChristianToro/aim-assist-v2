// Temporary stand-in for pages whose real content arrives in later milestones.
const PagePlaceholder = ({ title, description, milestone }) => (
  <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
    <h1 className="text-3xl font-semibold tracking-tight text-heading">
      {title}
    </h1>
    <p className="mt-3 max-w-prose text-muted">{description}</p>
    <p className="mt-8 inline-block rounded-lg border border-edge bg-surface px-4 py-2 text-sm text-muted">
      Coming in {milestone}
    </p>
  </section>
)

export default PagePlaceholder
