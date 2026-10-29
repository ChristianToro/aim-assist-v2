import Button from '../Button/Button'
import Tooltip from '../Tooltip/Tooltip'
import { useAuth } from '../../hooks/useAuth'

// /play needs a signed-in player, so signed out the button explains how
// to get one instead of leading to a redirect.
const StartTrainingButton = (props) => {
  const { user } = useAuth()

  if (user) {
    return (
      <Button to="/play" {...props}>
        Start Training
      </Button>
    )
  }

  return (
    <Tooltip content="Continue with Google to start playing">
      {(triggerProps) => (
        <Button {...props} {...triggerProps}>
          Start Training
        </Button>
      )}
    </Tooltip>
  )
}

export default StartTrainingButton
