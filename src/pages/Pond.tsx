import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pond() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to profile since pond feature is temporarily removed
    navigate('/profile');
  }, [navigate]);

  return null;
}
