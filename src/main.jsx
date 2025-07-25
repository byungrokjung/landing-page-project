import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import TopVideos from './TopVideos.jsx'
import CreativeStudio from './CreativeStudio.jsx'
import AIVideoGenerator from './AIVideoGenerator.jsx'
import Dashboard from './Dashboard.jsx'
import './index.css'

function Router() {
  const path = window.location.pathname;
  
  switch (path) {
    case '/videos':
      return <TopVideos />;
    case '/creative-studio':
      return <CreativeStudio />;
    case '/ai-video-generator':
      return <AIVideoGenerator />;
    case '/dashboard':
      return <Dashboard />;
    default:
      return <App />;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)