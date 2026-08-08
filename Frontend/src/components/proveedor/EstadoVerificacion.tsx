/**
 * Componente: EstadoVerificacion
 * 
 * Muestra el estado de verificación del proveedor con 3 estados visuales:
 * - Pendiente (amarillo): El perfil está siendo revisado
 * - Aprobado (verde): El perfil fue verificado exitosamente
 * - Rechazado (rojo): El perfil no cumplió los requisitos
 * 
 * Cada estado tiene su propio icono, color y mensaje descriptivo.
 */
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface EstadoVerificacionProps {
  estado: 'pendiente' | 'aprobado' | 'rechazado';
}

export default function EstadoVerificacion({ estado }: EstadoVerificacionProps) {
  const { t } = useTranslation();

  // Configuración visual para cada estado de verificación
  const config = {
    pendiente: {
      icon: Clock,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-700',
      label: t('proveedor.estado.pendiente', 'Pendiente de verificación'),
      description: t('proveedor.estado.pendiente_desc', 'Tu perfil está siendo revisado por nuestro equipo.'),
    },
    aprobado: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      textColor: 'text-green-700',
      label: t('proveedor.estado.aprobado', 'Verificado'),
      description: t('proveedor.estado.aprobado_desc', 'Tu perfil ha sido verificado exitosamente.'),
    },
    rechazado: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      textColor: 'text-red-700',
      label: t('proveedor.estado.rechazado', 'Rechazado'),
      description: t('proveedor.estado.rechazado_desc', 'Tu perfil no cumplió con los requisitos. Por favor, revisa la información.'),
    },
  };

  // Obtener configuración según el estado actual
  const { icon: Icon, bgColor, borderColor, iconColor, textColor, label, description } = config[estado];

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          <h3 className={`font-semibold ${textColor}`}>{label}</h3>
          <p className={`text-sm ${textColor} opacity-80 mt-1`}>{description}</p>
        </div>
      </div>
    </div>
  );
}