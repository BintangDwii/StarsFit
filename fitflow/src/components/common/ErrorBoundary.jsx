import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div className="card placeholder-card">
            <div className="empty-state">
              <h3>Terjadi kesalahan pada tampilan</h3>
              <p>
                Muat ulang halaman untuk mencoba lagi. Jika masalah berlanjut,
                periksa konsol browser.
              </p>
              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >
                Muat ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
