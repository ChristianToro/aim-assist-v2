import Card from '../components/Card/Card'
import ThemePicker from '../components/ThemePicker/ThemePicker'
import { useTheme } from '../hooks/useTheme'

// Preferences the app reads from the OS rather than exposing its own
// toggle for — documented here so the behaviour isn't invisible.
const SYSTEM_PREFERENCES = [
  {
    label: 'Reduced motion',
    detail:
      'With "reduce motion" enabled in your OS, interface animations collapse and hit particle bursts are skipped. Floating score text stays — it carries information.',
  },
  {
    label: 'Increased contrast',
    detail:
      'With "increase contrast" enabled, every theme strengthens its borders and brightens secondary text.',
  },
  {
    label: 'Sound',
    detail:
      'Sound is toggled per match from the Play page, and the choice is remembered between sessions.',
  },
]

const Settings = () => {
  const { themeId, themes, setTheme } = useTheme()

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-heading">
        Settings
      </h1>
      <p className="mt-3 text-muted">
        Themes, sound, and accessibility preferences. Your theme is saved to
        this browser.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-heading">
        Color Themes
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Applies to the whole app, including target and particle colors on the
        canvas.
      </p>
      <div className="mt-5">
        <ThemePicker themes={themes} value={themeId} onChange={setTheme} />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-heading">
        System preferences
      </h2>
      <p className="mt-1 text-sm text-muted">
        These follow your operating system — make the following changes through
        your OS settings.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {SYSTEM_PREFERENCES.map(({ label, detail }) => (
          <Card key={label}>
            <h3 className="font-medium text-heading">{label}</h3>
            <p className="mt-2 text-sm text-muted">{detail}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default Settings
