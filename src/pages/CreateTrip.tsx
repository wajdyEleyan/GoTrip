// src/pages/CreateTrip.tsx — Redirect zu Home (Erstellen läuft jetzt via Sheet)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateTrip() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/home', { replace: true }) }, [])
  return null
}
