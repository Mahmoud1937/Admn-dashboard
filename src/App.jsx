import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import PagePlaceholder from './components/PagePlaceholder';
import DashboardPage from './features/dashboard/pages/DashboardPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'providers', element: <PagePlaceholder title="Providers" /> },
      { path: 'clients', element: <PagePlaceholder title="Clients" /> },
      { path: 'provider-map', element: <PagePlaceholder title="Provider Map" /> },
      { path: 'categories', element: <PagePlaceholder title="Categories" /> },
      { path: 'services', element: <PagePlaceholder title="Services" /> },
      { path: 'card-activation', element: <PagePlaceholder title="Card Activation" /> },
      { path: 'governorates', element: <PagePlaceholder title="Governorates" /> },
      { path: 'cities', element: <PagePlaceholder title="Cities" /> },
      { path: 'card-pools', element: <PagePlaceholder title="Card Pools" /> },
      { path: 'support-tickets', element: <PagePlaceholder title="Support Tickets" /> },
      { path: 'activity', element: <PagePlaceholder title="Activity" /> },
      { path: 'sliders', element: <PagePlaceholder title="Sliders" /> },
      { path: 'plan-types', element: <PagePlaceholder title="Plan Types" /> },
      { path: 'offers', element: <PagePlaceholder title="Offers" /> },
      {
        path: '*',
        element: <PagePlaceholder title="Not found" description="This page doesn't exist." />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;