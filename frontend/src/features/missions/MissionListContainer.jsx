import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as missionsApi from '../../api/missions.api'
import * as propositionsApi from '../../api/propositions.api'
import * as demandesApi from '../../api/demandes.api'
import { unwrapList } from '../../utils/api'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import MissionListView from './MissionListView'

export default function MissionListContainer() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([missionsApi.getMissions(), propositionsApi.getPropositions(), demandesApi.getDemandes()])
      .then(([missionsData, propositionsData, demandesData]) => {
        const allMissions = unwrapList(missionsData)
        const propositionsById = {}
        unwrapList(propositionsData).forEach((p) => {
          propositionsById[p.id] = p
        })
        const demandesById = {}
        unwrapList(demandesData).forEach((d) => {
          demandesById[d.id] = d
        })

        const enriched = allMissions
          .map((mission) => {
            const proposition = propositionsById[mission.proposition]
            const demande = proposition ? demandesById[proposition.demande] : null
            return { ...mission, proposition, demande, titreDemande: demande?.titre }
          })
          .filter((mission) => {
            if (!user?.profileId || !mission.proposition || !mission.demande) return true
            if (user.role === 'CLIENT') return mission.demande.client === user.profileId
            if (user.role === 'PRESTATAIRE') return mission.proposition.prestataire === user.profileId
            return true
          })

        setMissions(enriched)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingSpinner label="Chargement de vos missions…" />

  const basePath = user?.role === 'CLIENT' ? '/client/missions' : '/prestataire/missions'
  const backTo = user?.role === 'CLIENT' ? '/client/dashboard' : '/prestataire/dashboard'

  return (
    <>
      <PageHeader title="Mes missions" subtitle="Suivez l'avancement de vos missions" showBack backTo={backTo} />
      {error && <ErrorMessage message="Impossible de charger vos missions." />}
      <MissionListView missions={missions} onOpen={(id) => navigate(`${basePath}/${id}`)} />
    </>
  )
}
