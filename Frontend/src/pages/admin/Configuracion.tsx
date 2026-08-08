import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type { Configuracion } from '../../types/configuracion';
export default function AdminConfiguracion() {
  const [items, setItems] = useState<Configuracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get<Configuracion[]>('/admin/configuracion')
      .then((res) => setItems(res.data))
      .catch(() => setError('No se pudo cargar la configuracion.'))
      .finally(() => setLoading(false));
  }, []);
  const handleChange = (clave: string, valor: string) => {
    setItems((prev) =>
      prev.map((item) => (item.clave === clave ? { ...item, valor } : item))
    );
  };
  const handleSave = async (clave: string) => {
    const item = items.find((i) => i.clave === clave);
    if (!item) return;
    setSavingKey(clave);
    setSavedKey(null);
    setError('');
    try {
      await api.put(`/admin/configuracion/${clave}`, { valor: item.valor });
      setSavedKey(clave);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      setError(`No se pudo guardar "${clave}".`);
    } finally {
      setSavingKey(null);
    }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold text-pv-green-dark mb-4">Textos de la Landing</h2>
      {loading && <p className="text-pv-gray">Cargando...</p>}
      {error && <p className="text-pv-danger mb-4">{error}</p>}
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <Card key={item.clave} className="flex flex-col gap-2">
            <span className="text-xs font-mono text-pv-gray">{item.clave}</span>
            {item.descripcion && (
              <span className="text-xs text-pv-gray/70">{item.descripcion}</span>
            )}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  value={item.valor}
                  onChange={(e) => handleChange(item.clave, e.target.value)}
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleSave(item.clave)}
                disabled={savingKey === item.clave}
              >
                {savingKey === item.clave ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
            {savedKey === item.clave && (
              <span className="text-xs text-pv-green">Guardado</span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
