import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(nombre, correo, password);
      navigate('/');
    } catch {
      setError(t('auth.error_registro'));
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md px-4">
      <h1 className="text-2xl font-bold text-pv-green-dark text-center mb-6">{t('auth.crear_cuenta')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('auth.nombre')} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <Input label={t('auth.correo')} type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <Input label={t('auth.contrasena')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-pv-danger">{error}</p>}
        <Button type="submit">{t('auth.registrarse')}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-pv-gray">
        {t('auth.ya_tienes_cuenta')}{' '}
        <Link to="/login" className="text-pv-green hover:underline">{t('auth.iniciar_sesion')}</Link>
      </p>
      <p className="mt-2 text-center text-sm text-pv-gray">
        {t('auth.sos_proveedor')}{' '}
        <Link to="/register/provider" className="text-pv-green hover:underline">{t('auth.registrar_negocio')}</Link>
      </p>
    </div>
  );
}
