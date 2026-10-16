import { Chip, Tooltip } from '@mui/material'
import { comparerAuBudget, formatAriary, formatAriaryRange } from '../utils/format'

const STYLES = {
  dans: { label: 'Dans le budget', color: '#2F9E6E' },
  'au-dessus': { label: 'Au-dessus du budget', color: '#D1484D' },
  'en-dessous': { label: 'Sous le budget', color: '#4A70A9' },
}

/** Petit indicateur : position du tarif proposé par rapport au budget de la demande. */
export default function BudgetIndicator({ tarif, budgetMin, budgetMax }) {
  const comparaison = comparerAuBudget(tarif, budgetMin, budgetMax)
  if (!comparaison) return null
  const style = STYLES[comparaison.niveau]
  const detail =
    comparaison.ecart > 0
      ? `${formatAriary(comparaison.ecart)} d'écart avec votre budget (${formatAriaryRange(budgetMin, budgetMax)})`
      : `Votre budget : ${formatAriaryRange(budgetMin, budgetMax)}`
  return (
    <Tooltip title={detail}>
      <Chip
        size="small"
        label={style.label}
        sx={{ bgcolor: `${style.color}1F`, color: style.color }}
      />
    </Tooltip>
  )
}
