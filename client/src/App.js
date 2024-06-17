import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from './components/PrivateRoute.js';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateList from './pages/CreateList';
import EditList from './pages/EditList';
import ViewList from './pages/ViewList';
import UserLists from './pages/UserLists';
import Profile from './pages/Profile';
import PlayQuiz from './pages/PlayQuiz';
import Register from './pages/Register';

export default function App() { 
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/entrar' element={<Login />} />
        <Route path='/cadastrar' element={<Register />} />

        <Route path='/criar-lista' element={<PrivateRoute><CreateList /></PrivateRoute>} />
        <Route path='/listas/:listId/editar' element={<PrivateRoute><EditList /></PrivateRoute>} />
        <Route path='/users/:username/listas' element={<PrivateRoute><UserLists /></PrivateRoute>} />
        <Route path='/perfil' element={<PrivateRoute>< Profile /></PrivateRoute>} />

        <Route path='/listas/:listId' element={<ViewList />} />
        <Route path='/listas/:listId/jogar' element={<PlayQuiz />} />
      </Routes>
      <ToastContainer />

    </>
  );
}