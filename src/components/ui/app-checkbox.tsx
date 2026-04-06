import './app-checkbox.scss'

interface AppCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function AppCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: AppCheckboxProps) {
  return (
    <label className="app-checkbox" data-disabled={disabled}>
      <input
        className="app-checkbox__native"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />

      <span className="app-checkbox__box" aria-hidden="true">
        {checked && <span className="i-mdi-check-bold app-checkbox__mark" />}
      </span>

      <span className="app-checkbox__copy">
        <span className="app-checkbox__label">{label}</span>
        {description && <span className="app-checkbox__description">{description}</span>}
      </span>
    </label>
  )
}
