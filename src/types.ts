export interface Activity {
  id: string;
  name: string;
  score: number; // 0 to 10
  weight: number; // percentage (e.g., 25 for 25% within activities)
}

export interface ObservationalRubric {
  participacion: number; // 1 to 5
  aportacionIdeas: number; // 1 to 5
  retencionDatos: number; // 1 to 5
  habilidadesArtisticas: number; // 1 to 5
  sociabilidad: number; // 1 to 5
  liderazgo: number; // 1 to 5
  resolucionProblemas: number; // 1 to 5
  inteligenciaEmocional: number; // 1 to 5
  apoyoCompaneros: number; // 1 to 5
}

export interface Student {
  id: string;
  name: string;
  attendanceScore: number; // 0 to 10
  midtermScore: number; // 0 to 10
  activities: Activity[];
  observational: ObservationalRubric;
}

export interface EvaluationWeights {
  midtermWeight: number; // e.g., 40 for 40%
  attendanceWeight: number; // e.g., 20 for 20%
  activitiesWeight: number; // e.g., 40 for 40%
}

export type LearningArchetype =
  | 'Líder Colaborativo'
  | 'Explorador Creativo'
  | 'Pensador Analítico'
  | 'Guía Empático'
  | 'Creador Multifacético'
  | 'Estudiante en Desarrollo';

export interface ClassRecommendation {
  id: string;
  title: string;
  category: 'Metodología' | 'Disruptores de Aula' | 'Apoyo Emocional' | 'Evaluación Dinámica';
  text: string;
  cuteIcon: string;
}
