import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import HomePage from '../features/home/HomePage.jsx'
import SergeantTablePage from '../features/sergeants/SergeantTablePage.jsx'
import EvaluationPage from '../features/evaluation/EvaluationPage.jsx'
import RosterPage from '../features/roster/RosterPage.jsx'
import { blockRoutes } from './blocks.jsx'

// One <Route> per page, added inside the <Layout> route — Layout draws the
// header and footer, so a page renders only its own content.
// blockRoutes stays outside it: a block brings its own chrome.
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sergeants" element={<SergeantTablePage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/roster" element={<RosterPage />} />
        </Route>
        {blockRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}