import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import TopVideos from './TopVideos.jsx'
import CreativeStudio from './CreativeStudio.jsx'
import AIVideoGenerator from './AIVideoGenerator.jsx'
import Dashboard from './Dashboard.jsx'
import SubscriptionPlans from './SubscriptionPlans.jsx'
import PaymentSuccess from './PaymentSuccess.jsx'
import PaymentCancel from './PaymentCancel.jsx'
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
    case '/subscription':
      return <SubscriptionPlans />;
    case '/payment/success':
      return <PaymentSuccess />;
    case '/payment/cancel':
      return <PaymentCancel />;
    default:
      return <App />;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)