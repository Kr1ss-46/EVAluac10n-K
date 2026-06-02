import { AlertCircle, Lightbulb, GraduationCap, TrendingDown, Users, Sparkles, Smile } from 'lucide-react';
import { Student, EvaluationWeights, ClassRecommendation } from '../types';
import { calculateStudentGrades } from '../initialData';

interface ClassAnalyticsProps {
  students: Student[];
  weights: EvaluationWeights;
  recommendations: ClassRecommendation[];
}

export default function ClassAnalytics({ students, weights, recommendations }: ClassAnalyticsProps) {
  // Compute group stats
  const totalStudents = students.length;
  
  const studentGrades = students.map(s => calculateStudentGrades(s, weights).finalGrade);
  const classAverage = totalStudents > 0 
    ? studentGrades.reduce((sum, g) => sum + g, 0) / totalStudents 
    : 10;
  
  const formattedAverage = parseFloat(classAverage.toFixed(2));
  const isBelowThreshold = formattedAverage < 7.0;

  // Additional counts for the top dashboard overview
  const studentsCountWithAlert = students.filter(s => {
    return calculateStudentGrades(s, weights).finalGrade < 7.0;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Mini Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Promedio Grupal */}
        <div className={`rounded-2xl p-4 border-2 flex items-center justify-between transition-all shadow-sm ${
          isBelowThreshold 
            ? 'bg-brand-pink-bg border-brand-pink-light text-slate-800' 
            : 'bg-emerald-50 border-emerald-100/80 text-emerald-800'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Promedio Grupal</p>
            <h4 className="text-3xl font-black mt-1">
              {totalStudents > 0 ? formattedAverage.toFixed(1) : '10.0'}
            </h4>
            <span className="text-[10px] block mt-1 font-semibold">
              {isBelowThreshold ? '⚠️ Requiere Atención' : '✔ Desempeño Favorable'}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${isBelowThreshold ? 'bg-brand-pink-light text-slate-700' : 'bg-emerald-100 text-emerald-600'}`}>
            {isBelowThreshold ? <TrendingDown className="w-6 h-6 animate-bounce" /> : <GraduationCap className="w-6 h-6" />}
          </div>
        </div>

        {/* Stat 2: Total Alumnos */}
        <div className="bg-brand-blue/15 border-2 border-brand-blue rounded-2xl p-4 text-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Alumnos Inscritos</p>
            <h4 className="text-3xl font-black mt-1">{totalStudents}</h4>
            <span className="text-[10px] block mt-1 font-semibold text-sky-750">En evaluación continua</span>
          </div>
          <div className="bg-white border border-brand-blue/60 text-sky-600 p-3 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Estudiantes en Riesgo */}
        <div className={`border-2 rounded-2xl p-4 flex items-center justify-between shadow-sm ${
          studentsCountWithAlert > 0 
            ? 'bg-brand-pink-bg border-brand-pink-light text-slate-850' 
            : 'bg-teal-50 border-teal-100/80 text-teal-800'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Alumnos con Alerta</p>
            <h4 className="text-3xl font-black mt-1">{studentsCountWithAlert}</h4>
            <span className="text-[10px] block mt-1 font-semibold opacity-70">
              {studentsCountWithAlert > 0 ? 'Calificación < 7.0' : 'Ninguno en riesgo'}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${studentsCountWithAlert > 0 ? 'bg-brand-pink-light text-slate-705' : 'bg-teal-100 text-teal-600'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerta Educativa conditional panel */}
      {isBelowThreshold ? (
        <div id="educational-alert-banner" className="bg-brand-pink-bg border-4 border-brand-pink-light rounded-3xl p-6 flex flex-col gap-4 animate-pulse-slow">
          <div className="flex items-start gap-4">
            <div className="bg-white border-2 border-brand-pink-light p-3 rounded-2xl text-brand-pink shrink-0">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Alerta de Rendimiento Activada
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-1.5">El rendimiento general del grupo ha bajado ({formattedAverage})</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Para prevenir el rezago curricular y el desfase pedagógico colectivo, te recomendamos implementar las siguientes dinámicas grupales y ajustes metodológicos flexibles de forma inmediata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={rec.id} className="bg-white hover:bg-brand-pink-bg/10 border-2 border-brand-pink-light rounded-2xl p-4 transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{rec.cuteIcon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-brand-pink-light px-2 py-0.5 rounded-md">
                      {rec.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-xs mb-1">{rec.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{rec.text}</p>
                </div>
                <div className="text-[10px] font-bold text-brand-pink mt-2.5 flex items-center justify-end gap-1">
                  <Sparkles className="w-3 h-3" /> Sugerido • Foco #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div id="educational-success-banner" className="bg-emerald-50 border-4 border-emerald-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 shrink-0">
            <Smile className="w-8 h-8 animate-bounce-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Grupo Aprobatorio
              </span>
              <span className="text-xs font-semibold text-emerald-700">✨ Excelente labor docente!</span>
            </div>
            <h3 className="text-base font-bold text-emerald-950 mt-1">Rendimiento colectivo estable, el promedio promedio: {formattedAverage}</h3>
            <p className="text-xs text-emerald-750">
              Las sugerencias y metodologías continúan abiertas en la sección inferior para potenciar el enriquecimiento de los alumnos más avanzados o brindar un soporte proactivo preventivo.
            </p>
          </div>
        </div>
      )}

      {/* Full Library of Suggested Pedagogical Strategies */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-4 border-brand-yellow shadow-md">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Estrategias y Ajustes Metodológicos Sugeridos</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Utiliza estas recomendaciones para flexibilizar la planeación de clase y propiciar un aprendizaje inclusivo adaptado a cada alumno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-brand-yellow/30 hover:bg-brand-yellow/50 rounded-2xl p-4 border border-brand-yellow flex items-start gap-3 transition-all">
              <span className="text-3xl shrink-0 mt-1">{rec.cuteIcon}</span>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-extrabold uppercase bg-white text-amber-800 border border-brand-yellow px-1.5 py-0.5 rounded">
                    {rec.category}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-gray-800">{rec.title}</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1">{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
