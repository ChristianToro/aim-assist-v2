import SettingsSection from '../components/SettingsSection/SettingsSection'
import ThemePicker from '../components/ThemePicker/ThemePicker'
import ThemePreview from '../components/ThemePicker/ThemePreview'
import { readStoredMute } from '../game/AudioManager'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTheme } from '../hooks/useTheme'

// One preference set outside this page, with its current value.
const PreferenceRow = ({ label, isOn, detail }) => (
  <li className="py-3 first:pt-0 last:pb-0">
    <div className="flex items-center gap-2">
      <h3 className="text-ui font-medium text-heading">{label}</h3>
      <span className="bg-bg px-1.5 py-0.5 text-meta text-body">
        {isOn ? 'On' : 'Off'}
      </span>
    </div>
    <p className="mt-1 text-ui text-muted">{detail}</p>
  </li>
)

const Settings = () => {
  const { themeId, themes, setTheme } = useTheme()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const moreContrast = useMediaQuery('(prefers-contrast: more)')
  const activeTheme = themes.find(({ id }) => id === themeId)

  // These aren't controlled here, so the rows show their values instead
  // of toggles: sound lives on the Play page, the rest in the OS.
  const preferences = [
    {
      label: 'Sound',
      isOn: !readStoredMute(),
      detail:
        'Turned on or off per match on the Play page, and remembered on this browser.',
    },
    {
      label: 'Reduced motion',
      isOn: reducedMotion,
      detail:
        'Interface animations collapse and hit particle bursts are skipped. Floating score text stays, since it carries information.',
    },
    {
      label: 'Increased contrast',
      isOn: moreContrast,
      detail:
        'Every theme strengthens its borders and brightens secondary text.',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-title font-medium tracking-tight text-heading">
        Settings
      </h1>
      <p className="mt-1 text-ui text-muted">
        {activeTheme.label} theme is on, saved to this browser.
      </p>

      <div className="mt-8">
        <SettingsSection
          title="Theme"
          description="Colours the whole app, including the targets and particles on the canvas."
          summary={
            <figure>
              <ThemePreview themeId={themeId} size="lg" />
              <figcaption className="mt-2 text-meta text-muted">
                {activeTheme.label}, as the targets will look in a match
              </figcaption>
            </figure>
          }
        >
          <ThemePicker themes={themes} value={themeId} onChange={setTheme} />
        </SettingsSection>

        <SettingsSection
          title="Set elsewhere"
          description="Sound is set on the Play page. Motion and contrast follow your operating system's settings."
        >
          <ul className="divide-y divide-edge">
            {preferences.map((preference) => (
              <PreferenceRow key={preference.label} {...preference} />
            ))}
          </ul>
        </SettingsSection>
      </div>
    </section>
  )
}

export default Settings
