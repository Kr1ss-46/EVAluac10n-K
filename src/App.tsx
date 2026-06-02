import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  Settings, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  Heart, 
  Award,
  Calendar,
  Layers,
  BarChart,
  Grid3X3,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Student, EvaluationWeights, Activity, ObservationalRubric } from './types';
import { 
  INITIAL_WEIGHTS, 
  INITIAL_STUDENTS, 
  PEDAGOGICAL_RECOMENDATIONS,
  calculateStudentGrades, 
  determineStudentArchetype 
} from './initialData';
import ClassAnalytics from './components/ClassAnalytics';
import SheetsIntegration from './components/SheetsIntegration';

export default function App() {
  // State variables list
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edtech_evaluator_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [weights, setWeights] = useState<EvaluationWeights>(() => {
    const saved = localStorage.getItem('edtech_evaluator_weights');
    return saved ? JSON.parse(saved) : INITIAL_WEIGHTS;
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return students.length > 0 ? students[0].id : '';
  });

  const [activeTab, setActiveTab] = useState<'quanti' | 'quali' | 'profile'>('quanti');
  
  // Custom alerts/toasts
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Save changes to localStorage automatically to avoid loss
  useEffect(() => {
    localStorage.setItem('edtech_evaluator_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edtech_evaluator_weights', JSON.stringify(weights));
  }, [weights]);

  // Alert handler utility
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Calculate sum of evaluations weights
  const totalWeightsSum = weights.midtermWeight + weights.attendanceWeight + weights.activitiesWeight;
  const isWeightsValid = totalWeightsSum === 100;

  // Add individual student
  const handleAddStudent = () => {
    const newId = `student-${Date.now()}`;
    const newStudent: Student = {
      id: newId,
      name: 'Nuevo Alumno',
      attendanceScore: 10,
      midtermScore: 10,
      activities: [
        { id: `act-${Date.now()}-1`, name: 'Tarea Semanal 1', score: 10, weight: 50 },
        { id: `act-${Date.now()}-2`, name: 'Proyecto del Mes', score: 10, weight: 50 },
      ],
      observational: {
        participacion: 5,
        aportacionIdeas: 5,
        retencionDatos: 5,
        habilidadesArtisticas: 5,
        sociabilidad: 5,
        liderazgo: 5,
        resolucionProblemas: 5,
        inteligenciaEmocional: 5,
        apoyoCompaneros: 5
      }
    };

    setStudents([...students, newStudent]);
    setSelectedStudentId(newId);
    showToast('¡Estudiante agregado con éxito! Presiona para cambiar su nombre.', 'success');
  };

  // Delete student
  const handleDeleteStudent = (idToDelete: string) => {
    if (students.length <= 1) {
      showToast('Debes mantener al menos un estudiante para evaluar.', 'error');
      return;
    }
    const updated = students.filter(s => s.id !== idToDelete);
    setStudents(updated);
    if (selectedStudentId === idToDelete) {
      setSelectedStudentId(updated[0].id);
    }
    showToast('Estudiante eliminado.', 'info');
  };

  // Student details update engine (inline triggers)
  const updateSelectedStudentField = (callback: (s: Student) => Student) => {
    const updated = students.map(s => {
      if (s.id === selectedStudentId) {
        return callback(s);
      }
      return s;
    });
    setStudents(updated);
  };

  // Edit midterm/attendance scores
  const handleScoreChange = (field: 'midtermScore' | 'attendanceScore', val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 10) num = 10;
    
    updateSelectedStudentField(s => ({
      ...s,
      [field]: num
    }));
  };

  // Edit activities weight parameters
  const handleWeightsChange = (field: keyof EvaluationWeights, val: string) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;

    setWeights(w => ({
      ...w,
      [field]: num
    }));
  };

  // Handle student main name inline editing
  const handleNameChange = (newName: string) => {
    updateSelectedStudentField(s => ({
      ...s,
      name: newName
    }));
  };

  // Manage internal Activities
  const handleAddActivity = () => {
    if (!selectedStudent) return;
    
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      name: 'Nueva Actividad',
      score: 10,
      weight: 20
    };

    updateSelectedStudentField(s => ({
      ...s,
      activities: [...s.activities, newAct]
    }));
    showToast('Actividad agregada al rubro.', 'success');
  };

  const handleUpdateActivity = (actId: string, updates: Partial<Activity>) => {
    updateSelectedStudentField(s => {
      const updatedActs = s.activities.map(act => {
        if (act.id === actId) {
          const res = { ...act, ...updates };
          // Bound score between 0 and 10, weight 0 and 100
          if (res.score < 0) res.score = 0;
          if (res.score > 10) res.score = 10;
          if (res.weight < 0) res.weight = 0;
          if (res.weight > 100) res.weight = 100;
          return res;
        }
        return act;
      });
      return { ...s, activities: updatedActs };
    });
  };

  const handleDeleteActivity = (actId: string) => {
    if (!selectedStudent || selectedStudent.activities.length <= 1) {
      showToast('Cada alumno debe conservar al menos una actividad evaluativa.', 'error');
      return;
    }
    updateSelectedStudentField(s => ({
      ...s,
      activities: s.activities.filter(act => act.id !== actId)
    }));
    showToast('Actividad eliminada.', 'info');
  };

  // Manage individual observational rating sliders (1-5)
  const handleObservationalChange = (parameter: keyof ObservationalRubric, value: number) => {
    updateSelectedStudentField(s => ({
      ...s,
      observational: {
        ...s.observational,
        [parameter]: value
      }
    }));
  };

  // Quick helper reset to defaults
  const handleResetData = () => {
    if (confirm('¿Estás seguro de que deseas reiniciar todos los datos a la configuración inicial? Se perderán tus cambios guardados.')) {
      setStudents(INITIAL_STUDENTS);
      setWeights(INITIAL_WEIGHTS);
      setSelectedStudentId(INITIAL_STUDENTS[0].id);
      showToast('Se han restaurado los datos iniciales de prueba.', 'info');
    }
  };

  // General statistics computation for active sheets
  const calculatedGrades = students.map(s => calculateStudentGrades(s, weights).finalGrade);
  const classAvg = students.length > 0 ? calculatedGrades.reduce((sum, g) => sum + g, 0) / students.length : 10;

  return (
    <div id="school-root-container" className="min-h-screen px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col gap-6 font-sans">
      
      {/* Dynamic cute Toast Notification */}
      {notification && (
        <div 
          id="toast-notification"
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border-2 text-sm font-bold transition-all transform animate-bounce-slow ${
            notification.type === 'success' 
               ? 'bg-brand-pink-bg text-slate-800 border-brand-pink-light' 
              : notification.type === 'error'
              ? 'bg-amber-50 text-amber-800 border-brand-yellow'
              : 'bg-brand-pink-bg text-slate-800 border-brand-blue'
          }`}
        >
          <span>{notification.type === 'success' ? '💝' : notification.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main Sweet Header with total statistics badge */}
      <header className="bg-white rounded-3xl p-6 shadow-sm border-4 border-brand-pink-light flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-brand-pink-bg p-4 rounded-3xl shrink-0 border-2 border-brand-pink-light select-none text-2xl animate-pulse-slow font-sans">
            🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-pink-light text-slate-700 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Educación Básica EdTech
              </span>
              <span className="text-[10px] text-gray-400 font-mono">v1.2.0</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight mt-1">
              Evaluador Integral Docente ✨
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Diseño Kawaii tierno y amigable creado especialmente para maestras y maestros. Evalúa de manera fácil, dinámica y holística el potencial de cada niño en tu escuela.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex flex-col items-end mr-2 text-right hidden sm:flex">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Promedio Escolar Grupal</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-base font-black ${classAvg < 7.0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {classAvg.toFixed(1)} / 10
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${classAvg < 7.0 ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
            </div>
          </div>
          
          <button
            onClick={handleResetData}
            className="text-xs font-bold px-4 py-2.5 rounded-2xl border-2 border-brand-pink-light bg-white hover:bg-brand-pink-bg text-brand-pink transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Reiniciar Demo 🍎
          </button>
          <a
            href="#sheets-integration-panel"
            className="text-xs font-bold px-4 py-2.5 rounded-2xl bg-brand-pink text-white hover:bg-rose-400 transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 border-b-2 border-black/10"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Configurar Excel / Sheets
          </a>
        </div>
      </header>

      {/* Primary Workspace: Left Student panel / Right Detail panel */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Student selector list & Overall Weight configurator (35% columns width equivalent) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Subcard A: Configuration of global evaluation rubrics */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border-4 border-brand-yellow flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Parámetros de Calificación Final</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Define el valor proporcional que posee cada rubro principal. La suma total **debe equivaler al 100%** al final.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mt-2">
              {/* Examen / Parciales */}
              <div className="bg-brand-yellow/30 p-2.5 rounded-xl border border-brand-yellow/60 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-700 mb-1 leading-none text-center">Parciales</span>
                <div className="flex items-center gap-0.5 mt-1">
                  <input
                    type="number"
                    className="w-12 bg-white text-center font-bold text-sm border border-brand-yellow rounded p-1"
                    value={weights.midtermWeight}
                    onChange={(e) => handleWeightsChange('midtermWeight', e.target.value)}
                  />
                  <span className="text-xs font-bold text-amber-700">%</span>
                </div>
              </div>

              {/* Asistencia */}
              <div className="bg-brand-pink-bg p-2.5 rounded-xl border border-brand-pink-light flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-700 mb-1 leading-none text-center">Asistencia</span>
                <div className="flex items-center gap-0.5 mt-1">
                  <input
                    type="number"
                    className="w-12 bg-white text-center font-bold text-sm border border-brand-pink-light rounded p-1"
                    value={weights.attendanceWeight}
                    onChange={(e) => handleWeightsChange('attendanceWeight', e.target.value)}
                  />
                  <span className="text-xs font-bold text-brand-pink">%</span>
                </div>
              </div>

              {/* Actividades generadas */}
              <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-700 mb-1 leading-none text-center">Actividades</span>
                <div className="flex items-center gap-0.5 mt-1">
                  <input
                    type="number"
                    className="w-12 bg-white text-center font-bold text-sm border border-sky-200 rounded p-1"
                    value={weights.activitiesWeight}
                    onChange={(e) => handleWeightsChange('activitiesWeight', e.target.value)}
                  />
                  <span className="text-xs font-bold text-sky-700">%</span>
                </div>
              </div>
            </div>

            {/* Sum validation warners */}
            <div className={`mt-1.5 text-center py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
              isWeightsValid 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <span>{isWeightsValid ? '✔' : '⚠️'}</span>
              <span>
                {isWeightsValid 
                  ? 'Configuración Balanceada (Suma: 100%)' 
                  : `La suma debe ser 100% (Suma actual: ${totalWeightsSum}%)`
                }
              </span>
            </div>
          </section>

          {/* Subcard B: Student continuous evaluation List panel */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border-4 border-brand-pink-light flex flex-col gap-4 flex-1 min-h-[400px] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-brand-pink-bg p-1.5 rounded-lg text-brand-pink border border-brand-pink-light">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Alumnos del Grupo</h3>
              </div>
              
              <button
                onClick={handleAddStudent}
                className="bg-brand-pink hover:bg-rose-450 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer active:scale-95 border-b-2 border-black/10"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Alumno
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Selecciona un alumno de la lista para editar en tiempo real sus calificaciones, agregar actividades dinámicas y ver su arquetipo observacional.
            </p>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[450px] pr-1.5">
              {students.map((student) => {
                const isSelected = student.id === selectedStudentId;
                const { finalGrade } = calculateStudentGrades(student, weights);
                const isPassing = finalGrade >= 7.0;
                const profileObj = determineStudentArchetype(student.observational);

                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-brand-pink-bg border-brand-pink-light shadow-md ring-2 ring-brand-pink-light/40' 
                        : 'bg-white hover:bg-brand-pink-bg/20 border-slate-100 hover:border-brand-pink-light hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl select-none shrink-0" role="img" aria-label="student item avatar">
                        {profileObj.emoji}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 text-xs truncate group-hover:text-brand-pink transition-colors">
                          {student.name}
                        </h4>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${profileObj.colorClass}`}>
                          {profileObj.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-black px-2 py-1 rounded-xl block ${
                          isPassing 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {finalGrade.toFixed(1)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStudent(student.id);
                        }}
                        className="text-gray-300 hover:text-rose-500 p-1.5 rounded-lg opacity-40 group-hover:opacity-100 hover:bg-rose-50/40 transition-all cursor-pointer"
                        title="Eliminar estudiante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto text-brand-pink bg-brand-pink-bg p-3 rounded-xl border border-brand-pink-light text-[10px] leading-relaxed">
              💡 <span className="font-bold">Dato Docente:</span> Para editar los datos de cualquier alumno basta seleccionarlo de la lista y se habilitará su panel completo a la derecha.
            </div>
          </section>

        </div>

        {/* Right Grid: Detailed Profile & Interactive Evaluation (65% columns width equivalent) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {selectedStudent ? (
            <div className="bg-white rounded-3xl shadow-sm border-4 border-brand-pink-light p-6 flex flex-col gap-6 shadow-md">
              
              {/* Header profile section with inline editable name and stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
                <div className="flex items-center gap-3.5 w-full">
                  <div className="text-4xl select-none animate-bounce-slow shrink-0">
                    {determineStudentArchetype(selectedStudent.observational).emoji}
                  </div>
                  <div className="w-full">
                    <span className="text-[10px] text-brand-pink font-extrabold uppercase tracking-wide block">
                      Ficha de Evaluación Integral del Estudiante
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 w-full">
                      {/* Name dynamic input as requested. Edits fields directly! */}
                      <input
                        type="text"
                        className="text-lg md:text-xl font-black text-slate-700 bg-transparent hover:bg-brand-pink-bg/40 focus:bg-brand-pink-bg/40 px-2 py-1 rounded-xl transition-all outline-none border-b border-transparent focus:border-brand-pink w-full md:max-w-md"
                        value={selectedStudent.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Escribe el nombre del alumno aquí"
                        title="Haz clic para editar el nombre directamente"
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 bg-brand-pink-bg px-4 py-2.5 rounded-2xl border-2 border-brand-pink-light">
                  <span className="text-xs font-bold text-slate-700">Calificación Final:</span>
                  <span className="text-lg font-black text-brand-pink">
                    {calculateStudentGrades(selectedStudent, weights).finalGrade.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Three Tab Navigation (Quantitative, Qualitative Rúbrica, Learning Archetype) */}
              <nav className="flex bg-brand-pink-bg p-1 rounded-2xl border-2 border-brand-pink-light">
                <button
                  onClick={() => setActiveTab('quanti')}
                  className={`flex-1 py-3 px-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'quanti' 
                      ? 'bg-brand-pink text-white shadow-md' 
                      : 'text-gray-500 hover:text-brand-pink hover:bg-brand-pink-bg/40'
                  }`}
                >
                  <BarChart className="w-4 h-4" /> Calificaciones Cuantitativas
                </button>
                <button
                  onClick={() => setActiveTab('quali')}
                  className={`flex-1 py-3 px-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'quali' 
                      ? 'bg-brand-pink text-white shadow-md' 
                      : 'text-gray-500 hover:text-brand-pink hover:bg-brand-pink-bg/40'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" /> Rúbrica Observacional
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 px-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-brand-pink text-white shadow-md' 
                      : 'text-gray-500 hover:text-brand-pink hover:bg-brand-pink-bg/40'
                  }`}
                >
                  <Award className="w-4 h-4" /> Perfil de Aprendizaje
                </button>
              </nav>

              {/* TAB CONTENT 1: Calificaciones Cuantitativas */}
              {activeTab === 'quanti' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* Row layout 1: Parciales and Attendance parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attendance input card */}
                    <div className="bg-brand-pink-bg p-4 rounded-2xl border-2 border-brand-pink-light flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">Asistencia Continua</label>
                        <span className="text-[10px] font-bold text-brand-pink uppercase tracking-wild bg-white px-2 py-0.5 rounded-full border border-brand-pink-light/60">
                          Peso: {weights.attendanceWeight}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">Puntaje global del estudiante para la asistencia del periodo (Escala 0 al 10).</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          className="flex-1 accent-brand-pink cursor-pointer"
                          value={selectedStudent.attendanceScore}
                          onChange={(e) => handleScoreChange('attendanceScore', e.target.value)}
                        />
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-brand-pink font-bold text-brand-pink text-sm w-12 text-center shrink-0">
                          {selectedStudent.attendanceScore}
                        </div>
                      </div>
                    </div>

                    {/* Midterm Examen input card */}
                    <div className="bg-brand-yellow/20 p-4 rounded-2xl border-2 border-brand-yellow flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">Examen o Parciales</label>
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wild bg-white px-2 py-0.5 rounded-full border border-brand-yellow">
                          Peso: {weights.midtermWeight}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">Calificación obtenida en pruebas periódicas u exámenes formales (Escala 0 al 10).</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          className="flex-1 accent-brand-pink cursor-pointer"
                          value={selectedStudent.midtermScore}
                          onChange={(e) => handleScoreChange('midtermScore', e.target.value)}
                        />
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-brand-yellow font-bold text-slate-700 w-12 text-center shrink-0">
                          {selectedStudent.midtermScore}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section inside: Activities dynamically added */}
                  <div className="bg-brand-blue/15 border-2 border-brand-blue p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-white text-slate-700 border border-brand-blue text-[10px] font-bold uppercase py-0.5 px-2 rounded-full">
                            Desglose de Rúbrica
                          </span>
                          <span className="text-[10px] font-bold text-slate-600">Total Rubro: {weights.activitiesWeight}%</span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-base mt-1">Actividades Escolares del Estudiante</h4>
                      </div>

                      <button
                        onClick={handleAddActivity}
                        className="bg-brand-pink hover:bg-rose-400 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer active:scale-95 border-b-2 border-black/10"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Actividad
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      Asigna calificaciones a proyectos, tareas y talleres adicionales. El peso representa la importancia relativa de esa actividad específica dentro de este rubro.
                    </p>

                    <div className="flex flex-col gap-3.5 mt-2">
                      {selectedStudent.activities.map((act) => (
                        <div key={act.id} className="bg-white border border-brand-blue/60 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-sm">
                          {/* Name Input Activity */}
                          <div className="flex-1">
                            <input
                              type="text"
                              value={act.name}
                              onChange={(e) => handleUpdateActivity(act.id, { name: e.target.value })}
                              className="font-bold text-gray-700 text-xs px-2 py-1 bg-brand-pink-bg/40 hover:bg-brand-pink-bg/70 focus:bg-white rounded border border-transparent focus:border-brand-pink outline-none w-full"
                              placeholder="Nombre de la actividad"
                              title="Nombre de la actividad"
                            />
                          </div>

                          {/* Score selector */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-gray-400">Nota (0-10):</span>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="10"
                              value={act.score}
                              onChange={(e) => handleUpdateActivity(act.id, { score: parseFloat(e.target.value) || 0 })}
                              className="w-12 text-center font-bold text-xs bg-slate-50 border border-slate-200 p-1.5 rounded"
                              placeholder="Nota"
                              title="Nota de la actividad"
                            />
                          </div>

                          {/* Weight selector */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-gray-400">Peso (%):</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={act.weight}
                              onChange={(e) => handleUpdateActivity(act.id, { weight: parseInt(e.target.value) || 0 })}
                              className="w-12 text-center font-bold text-xs bg-slate-50 border border-slate-200 p-1.5 rounded"
                              placeholder="Peso%"
                              title="Porcentaje de la actividad"
                            />
                            <span className="text-xs text-gray-500 font-bold">%</span>
                          </div>

                          {/* Trash button */}
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-gray-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remover actividad"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Calculated sum weights within Activities */}
                    {(() => {
                      const actsSumWeights = selectedStudent.activities.reduce((sum, act) => sum + act.weight, 0);
                      const isActsSumValid = actsSumWeights === 100;
                      return (
                        <div className={`text-[11px] font-bold p-2.5 rounded-lg flex items-center justify-between text-right ${
                          isActsSumValid ? 'text-slate-700 bg-white border border-brand-blue' : 'text-amber-700 bg-amber-50'
                        }`}>
                          <span>⚡ Promedio de Actividades: {
                            calculateStudentGrades(selectedStudent, weights).activitiesAverage.toFixed(1)
                          }/10</span>
                          <span>
                            {isActsSumValid 
                              ? '✔ Pesos sumados: 100%' 
                              : `⚠️ Se recomienda que sumen 100% para una media ponderada perfecta (Suma actual: ${actsSumWeights}%)`
                            }
                          </span>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: Rúbrica Observacional (Cualitativa) */}
              {activeTab === 'quali' && (
                <div className="flex flex-col gap-5 animate-fade-in text-xs">
                  
                  <div className="bg-brand-pink-bg rounded-2xl p-4 border-2 border-brand-pink-light flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-brand-pink tracking-wider">Metodología Cualitativa Holística</span>
                    <h4 className="font-bold text-gray-800 text-sm">Evaluación Observacional Integrada</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      El desarrollo de un niño en educación básica trasciende los exámenes. Asigna un nivel de desarrollo del **1 (Requiere guía) hasta 5 (Logro autónomo)** para cada pilar del desarrollo socio-emocional y cognitivo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Render standard 9 fields parameters mapping */}
                    {[
                      { key: 'participacion', title: 'Participación Activa', emoji: '🙋‍♂️', color: 'accent-brand-pink' },
                      { key: 'aportacionIdeas', title: 'Aportación de Ideas', emoji: '💡', color: 'accent-brand-blue' },
                      { key: 'retencionDatos', title: 'Retención de Datos', emoji: '🧠', color: 'accent-brand-yellow' },
                      { key: 'habilidadesArtisticas', title: 'Dibujo y Expresión Artística', emoji: '🎨', color: 'accent-brand-pink' },
                      { key: 'sociabilidad', title: 'Sociabilidad (Amigable)', emoji: '🍉', color: 'accent-brand-green' },
                      { key: 'liderazgo', title: 'Liderazgo Positivo', emoji: '🦁', color: 'accent-brand-yellow' },
                      { key: 'resolucionProblemas', title: 'Resolución de Problemas', emoji: '🔍', color: 'accent-brand-blue' },
                      { key: 'inteligenciaEmocional', title: 'Inteligencia Emocional', emoji: '💖', color: 'accent-brand-pink' },
                      { key: 'apoyoCompaneros', title: 'Apoyo a Compañeros', emoji: '🤝', color: 'accent-brand-green' }
                    ].map((item) => {
                      const scoreValue = selectedStudent.observational[item.key as keyof ObservationalRubric] || 5;
                      return (
                        <div key={item.key} className="bg-white border-2 border-slate-100 hover:border-brand-pink-light p-3.5 rounded-2xl flex flex-col gap-2 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-700 flex items-center gap-1.5">
                              <span>{item.emoji}</span> {item.title}
                            </span>
                            <span className="font-mono text-xs font-black text-slate-700 bg-brand-pink-bg px-2.5 py-1 rounded-lg border border-brand-pink-light/60">
                              Nivel {scoreValue} {scoreValue === 5 ? '⭐' : scoreValue >= 3 ? '✨' : '🌱'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-gray-400 font-bold">Guía</span>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              step="1"
                              className={`flex-1 ${item.color} cursor-pointer`}
                              value={scoreValue}
                              onChange={(e) => handleObservationalChange(item.key as keyof ObservationalRubric, parseInt(e.target.value))}
                            />
                            <span className="text-[9px] text-gray-400 font-bold">Líder</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB CONTENT 3: Perfil de Aprendizaje Inteligente (Archetype generation) */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  
                  {(() => {
                    const profile = determineStudentArchetype(selectedStudent.observational);
                    return (
                      <div className="flex flex-col gap-6">
                        
                        {/* Profile primary bento box */}
                        <div className={`rounded-3xl p-6 border-4 flex flex-col sm:flex-row items-center gap-5 text-gray-800 ${profile.colorClass}`}>
                          <div className="text-6xl select-none bg-white/70 p-5 rounded-3xl shrink-0 border-2 border-white/90 shadow-sm animate-pulse-slow">
                            {profile.emoji}
                          </div>
                          
                          <div className="text-center sm:text-left">
                            <span className="bg-white/80 border border-white/90 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block text-slate-700">
                              Insignia Observacional
                            </span>
                            <h3 className="text-2xl font-black mt-1.5">{profile.archetype} ({profile.badge})</h3>
                            <p className="text-xs mt-1 font-semibold leading-relaxed max-w-lg opacity-85 text-slate-700">
                              {profile.description}
                            </p>
                          </div>
                        </div>

                        {/* Bento visual item blocks: Strengths & Pedagogical suggestions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Card 1: Fortalezas del estudiante */}
                          <div className="bg-white border-4 border-brand-green rounded-2xl p-4 shadow-sm">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm mb-3">
                              🌟 Columna de Fortalezas
                            </h4>
                            <ul className="space-y-2 text-xs">
                              {profile.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-center gap-2 bg-brand-green/25 p-2.5 rounded-xl text-slate-800 border border-brand-green/35">
                                  <span className="text-emerald-700 font-bold">✔</span> {str}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Card 2: Recomendaciones personalizadas del aula */}
                          <div className="bg-white border-4 border-brand-pink-light rounded-2xl p-4 shadow-sm">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm mb-3">
                              ✏️ Plan de Mentoría Individual
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed bg-brand-pink-bg/50 p-3 rounded-xl border border-brand-pink-light/40">
                              {profile.archetype === 'Estudiante en Desarrollo' 
                                ? 'Focaliza el apoyo en la autoestima del alumno por medio de elogios concretos públicos y tareas con metas de corto plazo.'
                                : profile.archetype === 'Explorador Creativo'
                                ? 'Fomenta que ilustre o haga mapas mentales del contenido técnico durante exposiciones para retener mayor información lógica.'
                                : profile.archetype === 'Pensador Analítico'
                                ? 'Impúlsalo a cooperar compartiendo soluciones grupales en el pizarrón para desarrollar su asertividad y socialización.'
                                : 'Asígnale roles de responsabilidad rotativos (monitor, líder de materiales) para enriquecer su generosa empatía grupal.'
                              }
                            </p>
                          </div>

                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border-4 border-dashed border-brand-pink-light text-gray-400 shadow-inner">
              <p className="text-base font-bold">Por favor agrega o selecciona un estudiante para comenzar la evaluación.</p>
            </div>
          )}

        </div>

      </main>

      {/* Class analytical & Recommendations panel (Educational Alert system) */}
      <section className="mt-4">
        <ClassAnalytics 
          students={students} 
          weights={weights} 
          recommendations={PEDAGOGICAL_RECOMENDATIONS} 
        />
      </section>

      {/* Google Sheets Synchronization System setting card and connection step tutorial */}
      <section>
        <SheetsIntegration 
          students={students} 
          classAverage={classAvg} 
          onExportSuccess={(msg) => showToast(msg, 'success')} 
          onExportError={(msg) => showToast(msg, 'error')} 
        />
      </section>

      {/* Step by step download guide / Github deploy pages */}
      <footer className="bg-white rounded-3xl p-6 shadow-sm border-4 border-rose-100 flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">✈ Publicar en GitHub Pages y Descargar Proyecto</h3>
            <p className="text-xs text-gray-500">¿Cómo subir este código a GitHub e instalarlo como página gratuita?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed text-xs text-gray-600">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
            <h4 className="font-bold text-gray-800 text-xs">📦 Paso 1: Configurar en tu Computadora</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-500 pl-1">
              <li>Haz clic en el menú exportar de la interfaz de la plataforma para descargar el código comprimido en <span className="font-semibold text-rose-500">ZIP</span>.</li>
              <li>Descomprímelo en una carpeta de tu preferencia.</li>
              <li>Abre una terminal/consola en esa carpeta y ejecuta: <code className="font-mono bg-slate-200 text-purple-600 rounded px-1 text-[10px]">npm install</code> para instalar todas las dependencias escolares.</li>
              <li>Para iniciarlo localmente y probarlo escribe: <code className="font-mono bg-slate-200 text-purple-600 rounded px-1 text-[10px]">npm run dev</code>. Prúebalo en <code className="font-mono text-[10px]">http://localhost:3000</code>.</li>
            </ol>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
            <h4 className="font-bold text-gray-800 text-xs">🚀 Paso 2: Despliegue en GitHub Pages</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-500 pl-1">
              <li>Crea un repositorio nuevo en tu cuenta de <span className="font-semibold text-rose-500">GitHub</span>.</li>
              <li>Instala el paquete de ayuda ejecutando en tu terminal: <code className="font-mono bg-slate-200 text-purple-600 rounded px-1 text-[10px]">npm i gh-pages --save-dev</code>.</li>
              <li>Agrega en tu archivo <code className="font-mono text-[10px]">vite.config.ts</code> la propiedad: <code className="font-mono bg-slate-200 text-purple-600 rounded px-1 text-[10px]">base: "/nombre-de-tu-repositorio/"</code> en defineConfig.</li>
              <li>Escribe en los "scripts" de <code className="font-mono text-[10px]">package.json</code>: <code className="font-mono bg-slate-200 text-purple-600 rounded px-1 text-[10px]">"deploy": "gh-pages -d dist"</code> y <code className="font-mono bg-slate-200 text-purple-600 text-[10px] rounded px-1">"predeploy": "npm run build"</code>.</li>
              <li>Sube tus archivos a GitHub y ejecuta en tu máquina: <code className="font-mono bg-slate-200 text-purple-600 rounded px-1 text-[10px]">npm run deploy</code>. Listo! Tu evaluador estará en línea de forma gratuita.</li>
            </ol>
          </div>
        </div>

        <div className="text-center font-mono text-[10px] text-gray-400 border-t border-slate-100 pt-4 mt-2">
          Hecho con cariño para docentes excelentes ✨ Diseñado en base de la metodología cualitativa EdTech de intervención temprana.
        </div>
      </footer>

    </div>
  );
}
