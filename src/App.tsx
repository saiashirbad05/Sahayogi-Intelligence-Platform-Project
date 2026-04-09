
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { DataIntake } from './pages/DataIntake';
import { Survey } from './pages/Survey';
import { Team } from './pages/Team';
import { Chat } from './pages/Chat';
import { Auth } from './pages/Auth';
import { Volunteers } from './pages/Volunteers';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { VolunteersRegister } from './pages/VolunteersRegister';
import { TaskManage } from './pages/TaskManage';
import { VolunteerStatus } from './pages/VolunteerStatus';
import { Impact } from './pages/Impact';
import { ErrorBoundary } from './components/ErrorBoundary';
function App() {
  return (
    <Router>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/team" element={<Team />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/intake" element={<DataIntake />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/volunteers/register" element={<VolunteersRegister />} />
            <Route path="/volunteers/status" element={<VolunteerStatus />} />
            <Route path="/tasks" element={<TaskManage />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}

export default App;
