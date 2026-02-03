'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom red marker icon
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = redIcon

interface MapMarker {
  lat: number
  lng: number
  id: string
  label?: string
}

interface MapWrapperProps {
  center: { lat: number; lng: number }
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  zoom?: number
  className?: string
}

export default function MapWrapper({ 
  center, 
  markers = [], 
  onMarkerClick, 
  zoom = 12,
  className = ''
}: MapWrapperProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView([center.lat, center.lng], zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], zoom)
    }
  }, [center.lat, center.lng, zoom])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach(markerData => {
      const marker = L.marker([markerData.lat, markerData.lng])
        .addTo(mapRef.current!)
      
      if (markerData.label) {
        marker.bindPopup(markerData.label)
      }

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(markerData.id))
      }

      markersRef.current.push(marker)
    })
  }, [markers, onMarkerClick])

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[400px] ${className}`}
      style={{ zIndex: 1 }}
    />
  )
}
