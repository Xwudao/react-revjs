import { useEffect, useId, useMemo, useRef, useState } from 'react'
import './app-select.scss'

export interface AppSelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
}

interface AppSelectProps<T extends string> {
  value: T
  options: readonly AppSelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  ariaLabel?: string
}

export function AppSelect<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
}: AppSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reactId = useId()
  const listboxId = `${reactId}-listbox`

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  )

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="app-select" data-open={open} data-disabled={disabled} ref={rootRef}>
      <button
        type="button"
        className="app-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="app-select__value">
          <span className="app-select__label">{selectedOption.label}</span>
          {selectedOption.description && (
            <span className="app-select__description">{selectedOption.description}</span>
          )}
        </span>
        <span
          className={
            open
              ? 'i-mdi-chevron-up app-select__icon'
              : 'i-mdi-chevron-down app-select__icon'
          }
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="app-select__menu" id={listboxId} role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="app-select__option"
              role="option"
              aria-selected={option.value === value}
              data-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span className="app-select__option-copy">
                <span className="app-select__option-label">{option.label}</span>
                {option.description && (
                  <span className="app-select__option-description">
                    {option.description}
                  </span>
                )}
              </span>
              {option.value === value && (
                <span className="i-mdi-check app-select__check" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
