import { useNavigate } from 'react-router-dom'
import SeriousMilitaryHero from './SeriousMilitaryHero.jsx'

// Landing page — navigates to /sergeants or /evaluation on CTA click
export default function HomePage() {
  const navigate = useNavigate()

  return (
    <SeriousMilitaryHero
      onEnter={() => navigate('/sergeants')}
      onEvaluate={() => navigate('/evaluation')}
      onRoster={() => navigate('/roster')}
    />
  )
}