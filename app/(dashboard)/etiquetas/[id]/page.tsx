"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import QRCode from "qrcode"

export default function EtiquetaDetallePage() {
  const params = useParams();
  const { id } = params;

  const [etiqueta, setEtiqueta] = useState<any>(null)
  const [qrUrl, setQrUrl] = useState<string>("")

  useEffect(() => {
    const fetchEtiqueta = async () => {
      const res = await fetch(`/api/etiquetas/${id}`)
      if (res.ok) {
        const data = await res.json()
        setEtiqueta(data)
        if (data.codigo_qr) {
          const url = await QRCode.toDataURL(data.codigo_qr)
          setQrUrl(url)
        }
      }
    }
    fetchEtiqueta()
  }, [id])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle de la Etiqueta</h1>
      <p>ID: {id}</p>
      {etiqueta && (
        <div className="mt-4">
          <p><b>Tipo de etiqueta:</b> {etiqueta.tipo_etiqueta}</p>
          <p><b>Código QR:</b> {etiqueta.codigo_qr}</p>
          {qrUrl && (
            <img src={qrUrl} alt="QR" className="mt-4 w-40 h-40" />
          )}
        </div>
      )}
      {!etiqueta && <div className="mt-4 text-muted-foreground">Cargando información...</div>}
    </div>
  );
} 