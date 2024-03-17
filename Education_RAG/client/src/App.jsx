import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './Signup';
import Login from './Login';
import Chat from './Chat';
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} /> {/* Protect this route */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;