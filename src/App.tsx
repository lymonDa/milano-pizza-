import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { BranchProvider } from './contexts/BranchContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/feature/Navbar';
import { Footer } from './components/feature/Footer';

function App() {
  const basePath = typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/';

  return (
    <I18nextProvider i18n={i18n}>
      <BranchProvider>
        <CartProvider>
          <BrowserRouter basename={basePath}>
            <div className="min-h-screen flex flex-col bg-background-50">
              <Navbar />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </BranchProvider>
    </I18nextProvider>
  );
}

export default App;