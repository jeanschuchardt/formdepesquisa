import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const rootElement = document.getElementById('root');

function renderStartupError(error) {
  rootElement.innerHTML = `
    <main class="startup-error">
      <h1>Erro ao carregar a aplicacao</h1>
      <p>Abra o Console do navegador para ver os detalhes completos.</p>
      <pre>${error?.message || String(error)}</pre>
    </main>
  `;
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="startup-error">
          <h1>Erro ao renderizar o formulario</h1>
          <p>Abra o Console do navegador para ver os detalhes completos.</p>
          <pre>{this.state.error.message}</pre>
        </main>
      );
    }

    return this.props.children;
  }
}

import('./App.jsx')
  .then(({ default: App }) => {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  })
  .catch(renderStartupError);
