import React from 'react'

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode
  fallback?: React.ReactNode
}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  // componentDidCatch(error, errorInfo) {
  //   // You can also log the error to an error reporting service
  //   logErrorToMyService(error, errorInfo);
  // }

  render() {
    if ((this.state as any).hasError) {
      // You can render any custom fallback UI
      if ((this.props as any).fallback) {
        return (this.props as any).fallback
      } else {
        return <h1>Something went wrong.</h1>
      }
    }

    return (this.props as any).children
  }
}
