import { Student, EvaluationWeights, ClassRecommendation } from './types';

export const INITIAL_WEIGHTS: EvaluationWeights = {
  midtermWeight: 40,
  attendanceWeight: 20,
  activitiesWeight: 40,
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Sofía Martínez Pérez',
    attendanceScore: 10,
    midtermScore: 9,
    activities: [
      { id: 'act-1', name: 'Maqueta del Sistema Solar', score: 10, weight: 40 },
      { id: 'act-2', name: 'Exposición de Culturas', score: 9.5, weight: 30 },
      { id: 'act-3', name: 'Cuaderno de apuntes', score: 8, weight: 30 }
    ],
    observational: {
      participacion: 5,
      aportacionIdeas: 4,
      retencionDatos: 4,
      habilidadesArtisticas: 5,
      sociabilidad: 5,
      liderazgo: 4,
      resolucionProblemas: 3,
      inteligenciaEmocional: 4,
      apoyoCompaneros: 5
    }
  },
  {
    id: 'student-2',
    name: 'Mateo González Ruiz',
    attendanceScore: 9,
    midtermScore: 8,
    activities: [
      { id: 'act-4', name: 'Maqueta del Sistema Solar', score: 8, weight: 40 },
      { id: 'act-5', name: 'Exposición de Culturas', score: 8.5, weight: 30 },
      { id: 'act-6', name: 'Cuaderno de apuntes', score: 7, weight: 30 }
    ],
    observational: {
      participacion: 3,
      aportacionIdeas: 4,
      retencionDatos: 5,
      habilidadesArtisticas: 2,
      sociabilidad: 3,
      liderazgo: 3,
      resolucionProblemas: 5,
      inteligenciaEmocional: 4,
      apoyoCompaneros: 3
    }
  },
  {
    id: 'student-3',
    name: 'Valentina Silva López',
    attendanceScore: 8,
    midtermScore: 6.5,
    activities: [
      { id: 'act-7', name: 'Maqueta del Sistema Solar', score: 7, weight: 40 },
      { id: 'act-8', name: 'Exposición de Culturas', score: 6.5, weight: 30 },
      { id: 'act-9', name: 'Cuaderno de apuntes', score: 6, weight: 30 }
    ],
    observational: {
      participacion: 4,
      aportacionIdeas: 5,
      retencionDatos: 3,
      habilidadesArtisticas: 5,
      sociabilidad: 4,
      liderazgo: 4,
      resolucionProblemas: 3,
      inteligenciaEmocional: 5,
      apoyoCompaneros: 4
    }
  },
  {
    id: 'student-4',
    name: 'Emilio Castro Méndez',
    attendanceScore: 6,
    midtermScore: 5.5,
    activities: [
      { id: 'act-10', name: 'Maqueta del Sistema Solar', score: 6, weight: 40 },
      { id: 'act-11', name: 'Exposición de Culturas', score: 5, weight: 30 },
      { id: 'act-12', name: 'Cuaderno de apuntes', score: 5.5, weight: 30 }
    ],
    observational: {
      participacion: 2,
      aportacionIdeas: 2,
      retencionDatos: 3,
      habilidadesArtisticas: 3,
      sociabilidad: 2,
      liderazgo: 1,
      resolucionProblemas: 2,
      inteligenciaEmocional: 2,
      apoyoCompaneros: 3
    }
  }
];

export const PEDAGOGICAL_RECOMENDATIONS: ClassRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Gamificación de Conceptos Clave',
    category: 'Metodología',
    text: 'Aplica dinámicas de juego rápido al inicio de cada jornada (como Kahoot físico o tarjetas de memoria) para reforzar la retención de datos en estudiantes con baja participación.',
    cuteIcon: '🎮'
  },
  {
    id: 'rec-2',
    title: 'Agrupación por Parejas de Apoyo (Peer Tutoring)',
    category: 'Metodología',
    text: 'Forma parejas de trabajo donde alumnos con alto puntaje de \"Apoyo a compañeros\" cooperen con quienes presentan dificultades en actividades prácticas. Esto potenciará la sociabilidad y el aprendizaje activo.',
    cuteIcon: '🤝'
  },
  {
    id: 'rec-3',
    title: 'Estación de Arte Relámpago (Micro-pausas)',
    category: 'Apoyo Emocional',
    text: 'Incorpora dibujos guiados o representaciones visuales de temas complejos. Ayuda a canalizar el estrés y fomenta las habilidades artísticas como puente de comprensión cognitiva.',
    cuteIcon: '🎨'
  },
  {
    id: 'rec-4',
    title: 'Círculos de Inteligencia Emocional Semanal',
    category: 'Apoyo Emocional',
    text: 'Dedica 15 minutos semanales para debatir dilemas escolares y dinámicas de empatía, dándole protagonismo a los que demuestren bajo rendimiento grupal para re-integrarlos positivamente.',
    cuteIcon: '💖'
  },
  {
    id: 'rec-5',
    title: 'Preguntas con Recompensas de Confianza',
    category: 'Disruptores de Aula',
    text: 'Evita la evaluación fría sorpresiva. Implementa retos de preguntas grupales donde la aportación de ideas sea el único indicador evaluativo para remover barreras psicológicas y temores de fracaso.',
    cuteIcon: '🚀'
  }
];

export function calculateStudentGrades(student: Student, weights: EvaluationWeights) {
  const midtermContribution = (student.midtermScore * (weights.midtermWeight / 100));
  const attendanceContribution = (student.attendanceScore * (weights.attendanceWeight / 100));
  
  // Calculate weighted average score for activities
  let actScore = 0;
  if (student.activities.length > 0) {
    let totalActWeight = 0;
    let weightedScoreSum = 0;
    student.activities.forEach(act => {
      weightedScoreSum += (act.score * act.weight);
      totalActWeight += act.weight;
    });
    
    // Fallback if weights are 0
    if (totalActWeight > 0) {
      actScore = weightedScoreSum / totalActWeight;
    } else {
      // equal weighting if total weight is 0
      const sum = student.activities.reduce((sum, act) => sum + act.score, 0);
      actScore = sum / student.activities.length;
    }
  }
  
  const activitiesContribution = (actScore * (weights.activitiesWeight / 100));
  const finalGrade = midtermContribution + attendanceContribution + activitiesContribution;

  return {
    midtermContribution,
    attendanceContribution,
    activitiesContribution,
    activitiesAverage: actScore,
    finalGrade: parseFloat(finalGrade.toFixed(2))
  };
}

export function determineStudentArchetype(obs: Student['observational']): {
  archetype: string;
  badge: string;
  colorClass: string;
  bgColorClass: string;
  emoji: string;
  description: string;
  strengths: string[];
} {
  const {
    participacion,
    aportacionIdeas,
    retencionDatos,
    habilidadesArtisticas,
    sociabilidad,
    liderazgo,
    resolucionProblemas,
    inteligenciaEmocional,
    apoyoCompaneros
  } = obs;

  const socialSum = sociabilidad + liderazgo + apoyoCompaneros;
  const creativeSum = habilidadesArtisticas + aportacionIdeas + participacion;
  const analyticalSum = retencionDatos + resolucionProblemas + inteligenciaEmocional;
  const averageAll = (socialSum + creativeSum + analyticalSum) / 9;

  if (averageAll <= 2.5) {
    return {
      archetype: 'Estudiante en Desarrollo',
      badge: 'Semillita',
      colorClass: 'text-amber-600 border-amber-200 bg-amber-50',
      bgColorClass: 'bg-amber-100',
      emoji: '🌱',
      description: 'Estudiante que se beneficia grandemente de un entorno estructurado, tutorías personalizadas y refuerzo positivo diario.',
      strengths: ['Atención focalizada', 'Potencial de crecimiento', 'Recepción de apoyo']
    };
  }

  if (creativeSum > socialSum && creativeSum > analyticalSum) {
    return {
      archetype: 'Explorador Creativo',
      badge: 'Artista de Ideas',
      colorClass: 'text-purple-600 border-purple-200 bg-purple-50',
      bgColorClass: 'bg-purple-100',
      emoji: '🎨',
      description: 'Destaca por expresarse de forma artística, aportar puntos de vista fuera de la caja y disfrutar el aprendizaje estético.',
      strengths: ['Habilidades artísticas', 'Generación de ideas', 'Participación entusiasta']
    };
  }

  if (socialSum > creativeSum && socialSum > analyticalSum) {
    if (liderazgo >= 4) {
      return {
        archetype: 'Líder Colaborativo',
        badge: 'Guía del Equipo',
        colorClass: 'text-blue-600 border-blue-200 bg-blue-50',
        bgColorClass: 'bg-blue-100',
        emoji: '🦁',
        description: 'Tiene habilidades naturales para organizar grupos, motivar a sus compañeros y propiciar la armonía escolar.',
        strengths: ['Liderazgo proactivo', 'Sociabilidad sincera', 'Comunicación asertiva']
      };
    } else {
      return {
        archetype: 'Guía Empático',
        badge: 'Corazón del Aula',
        colorClass: 'text-rose-600 border-rose-200 bg-rose-50',
        bgColorClass: 'bg-rose-100',
        emoji: '💖',
        description: 'Siempre dispuesto a respaldar a sus compañeros, excelente mediador de conflictos y con una profunda inteligencia emocional.',
        strengths: ['Apoyo incondicional', 'Inteligencia emocional', 'Sociabilidad amigable']
      };
    }
  }

  if (analyticalSum > creativeSum && analyticalSum > socialSum) {
    return {
      archetype: 'Pensador Analítico',
      badge: 'Mente Brillante',
      colorClass: 'text-emerald-600 border-emerald-200 bg-emerald-50',
      bgColorClass: 'bg-emerald-100',
      emoji: '🔍',
      description: 'Gran capacidad para absorber datos técnicos, resolver problemas complejos de lógica y concentrarse meticulosamente.',
      strengths: ['Resolución de problemas', 'Memoria y retención', 'Autogestión emocional']
    };
  }

  return {
    archetype: 'Creador Multifacético',
    badge: 'Camaleón Escolar',
    colorClass: 'text-teal-600 border-teal-200 bg-teal-50',
    bgColorClass: 'bg-teal-100',
    emoji: '🦄',
    description: 'Posee un balance extraordinario en múltiples disciplinas; es tanto empático y sociable como analítico y participativo.',
    strengths: ['Adaptabilidad', 'Rendimiento equilibrado', 'Sociabilidad positiva']
  };
}
