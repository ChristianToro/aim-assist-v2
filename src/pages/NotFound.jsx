import Button from '../components/Button/Button'

const NotFound = () => (
  <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
    <p className="text-6xl font-semibold tracking-tight text-accent">404</p>
    <h1 className="mt-4 text-2xl font-semibold text-heading">
      Target not found
    </h1>
    <p className="mt-2 text-muted">
      This page doesn&apos;t exist — that one&apos;s a miss.
    </p>
    <Button to="/" className="mt-8">
      Back to Home
    </Button>
  </section>
)

export default NotFound
