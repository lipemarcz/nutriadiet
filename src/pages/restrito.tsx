import React from 'react'
import InviteGate from '../components/bmteam/InviteGate'
import MealsGrid from '../components/bmteam/MealsGrid'

const RestritoPage: React.FC = () => {
  return (
    <InviteGate>
      <div className="p-6">
        <MealsGrid initialCount={3} />
      </div>
    </InviteGate>
  )
}

export default RestritoPage
