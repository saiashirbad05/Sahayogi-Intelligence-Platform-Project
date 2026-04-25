
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ErrorBoundary } from './components';
import { 
  Home, Dashboard, Upload, DataIntake, Survey, Team, Chat, Auth, 
  Volunteers, Explore, Profile, VolunteersRegister, TaskManage, 
  VolunteerStatus, Impact 
} from './pages';
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
