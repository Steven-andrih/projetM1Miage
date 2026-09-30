import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Snackbar } from '@mui/material'
import * as missionsApi from '../../api/missions.api'
import * as propositionsApi from '../../api/propositions.api'
import * as demandesApi from '../../api/demandes.api'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import MissionDetailView from './MissionDetailView'

export default function MissionDetailContainer() {
  const { id } = useParams()
  const { user } = useAuth()

  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const load = () => {
    setLoading(true)
    missionsApi
      .getMission(id)
      .then(async (missionData) => {
        let proposition = null
        let demande = null
        try {
          proposition = await propositionsApi.getProposition(missionData.proposition)
          demande = await demandesApi.getDemande(proposition.demande)
        } catch {
          // proposition/demande potentiellement inaccessible : on affiche la mission quand même
        }
        setMission({ ...missionData, proposition, demande })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const isPrestataire = user?.role === 'PRESTATAIRE'
  const backTo = user?.role === 'CLIENT' ? '/client/missions' : '/prestataire/missions'

  const handleMarkTerminee = async () => {
    setSubmitting(true)
    setError(false)
    try {
      await missionsApi.updateMission(id, { statut: 'TERMINEE' })
      setSuccessOpen(true)
      load()
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Chargement de la mission…" />
  if (!mission) return <ErrorMessage message="Cette mission est introuvable." />

  return (
    <>
      <PageHeader
        title={mission.demande?.titre || `Mission #${mission.id}`}
        subtitle={`Mission #${mission.id}`}
        showBack
        backTo={backTo}
      />
      {error && <ErrorMessage message="Une erreur est survenue." />}
      <MissionDetailView
        mission={mission}
        isPrestataire={isPrestataire}
        onMarkTerminee={handleMarkTerminee}
        submitting={submitting}
      />
      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Mission mise à jour avec succès.
        </Alert>
      </Snackbar>
    </>
  )
}
