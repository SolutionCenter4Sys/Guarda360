import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex flex-col items-center justify-center text-center py-20 px-6"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-cancelado-bg)', color: 'var(--color-cancelado)' }}
            aria-hidden="true"
          >
            <AlertTriangle size={32} />
          </div>
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Algo deu errado
          </h2>
          <p
            className="text-sm max-w-xs mb-6"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {this.state.error?.message ?? 'Ocorreu um erro inesperado nesta seção.'}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
