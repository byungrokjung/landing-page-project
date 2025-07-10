import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import TopVideos from './TopVideos.jsx'
import './index.css'

function Router() {
  const path = window.location.pathname;
  
  switch (path) {
    case '/videos':
      return <TopVideos />;
    default:
      return <App />;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)