import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Snackbar, Typography } from '@mui/material'
import * as missionsApi from '../../api/missions.api'
import * as propositionsApi from '../../api/propositions.api'
import * as demandesApi from '../../api/demandes.api'
import * as avisApi from '../../api/avis.api'
import { unwrapList } from '../../utils/api'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import MissionDetailView from './MissionDetailView'
import AvisForm from './AvisForm'
import AvisSummary from './AvisSummary'

export default function MissionDetailContainer() {
  const { id } = useParams()
  const { user } = useAuth()

  const [mission, setMission] = useState(null)
  const [avis, setAvis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([missionsApi.getMission(id), avisApi.getAvis()])
      .then(async ([missionData, avisData]) => {
        let proposition = null
        let demande = null
        try {
          proposition = await propositionsApi.getProposition(missionData.proposition)
          demande = await demandesApi.getDemande(proposition.demande)
        } catch {
          // proposition/demande potentiellement inaccessible : on affiche la mission quand même
        }
        setMission({ ...missionData, proposition, demande })

        const allAvis = unwrapList(avisData)
        const existing = allAvis.find((a) => a.mission === Number(id))
        setAvis(existing || null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const isPrestataire = user?.role === 'PRESTATAIRE'
  const isClient = user?.role === 'CLIENT'
  const backTo = isClient ? '/client/missions' : '/prestataire/missions'

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

  const handleSubmitAvis = async ({ note, commentaire }) => {
    setSubmitting(true)
    setError(false)
    try {
      await avisApi.createAvis({ mission: Number(id), note, commentaire })
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

      {mission.statut === 'TERMINEE' && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Avis
          </Typography>
          {avis ? (
            <AvisSummary avis={avis} />
          ) : isClient ? (
            <AvisForm onSubmit={handleSubmitAvis} submitting={submitting} />
          ) : (
            <Typography color="text.secondary">Le client n'a pas encore laissé d'avis.</Typography>
          )}
        </>
      )}

      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Opération effectuée avec succès.
        </Alert>
      </Snackbar>
    </>
  )
}
