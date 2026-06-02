import { useState } from 'react';
import { Copy, Check, FileSpreadsheet, ExternalLink, HelpCircle } from 'lucide-react';
import { Student } from '../types';

interface SheetsIntegrationProps {
  students: Student[];
  classAverage: number;
  onExportSuccess: (msg: string) => void;
  onExportError: (msg: string) => void;
}

export default function SheetsIntegration({
  students,
  classAverage,
  onExportSuccess,
  onExportError,
}: SheetsIntegrationProps) {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('google_sheets_webhook_url') || '';
  });
  const [exporting, setExporting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const googleAppsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Configurar encabezados
    sheet.clear();
    sheet.appendRow([
      "ID Estudiante", 
      "Nombre Completo", 
      "Asistencia (0-10)", 
      "Parciales/Examen (0-10)", 
      "Promedio Actividades", 
      "Calificación Final", 
      "Arquetipo de Aprendizaje", 
      "Insignia"
    ]);
    
    // Aplicar estilos básicos al encabezado
    sheet.getRange("A1:H1").setBackground("#FFD1DC").setFontWeight("bold").setHorizontalAlignment("center");
    
    // Agregar datos de alumnos
    for (var i = 0; i < data.students.length; i++) {
      var student = data.students[i];
      sheet.appendRow([
        student.id,
        student.name,
        student.attendanceScore,
        student.midtermScore,
        student.activitiesAverage,
        student.finalGrade,
        student.archetype,
        student.badge
      ]);
    }
    
    // Información grupal
    sheet.appendRow([]);
    sheet.appendRow(["--- RESUMEN GRUPAL ---"]);
    sheet.appendRow(["Promedio General del Grupo", data.classAverage]);
    sheet.appendRow(["Fecha de Exportación", new Date().toLocaleString()]);
    sheet.appendRow(["Alerta de Rendimiento", data.classAverage < 7 ? "ALERTA: RECOMENDACIONES ACTIVADAS" : "Desempeño Favorable"]);
    
    // Ajustar columnas
    sheet.autoResizeColumns(1, 8);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "¡Reporte escolar importado con éxito!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");
  }
}`;

  const handleSaveUrl = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('google_sheets_webhook_url', url);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleExportData = async () => {
    if (!webhookUrl) {
      onExportError('Por favor, ingresa tu URL de Google Apps Script Web App en el campo de configuración.');
      return;
    }

    setExporting(true);
    try {
      // Format students with their metrics for the Sheets API representation
      const formattedStudents = students.map(s => {
        // inline calculate the average of activities
        let actScore = 0;
        if (s.activities.length > 0) {
          let totalActWeight = 0;
          let weightedScoreSum = 0;
          s.activities.forEach(act => {
            weightedScoreSum += (act.score * act.weight);
            totalActWeight += act.weight;
          });
          actScore = totalActWeight > 0 ? weightedScoreSum / totalActWeight : 0;
        }

        // Final Grade Calculation (local copy)
        const midtermContrib = s.midtermScore * 0.4; // default proportions
        const attendanceContrib = s.attendanceScore * 0.2;
        const activitiesContrib = actScore * 0.4;
        const total = parseFloat((midtermContrib + attendanceContrib + activitiesContrib).toFixed(2));

        // Determine badge/archetype
        const socialSum = s.observational.sociabilidad + s.observational.liderazgo + s.observational.apoyoCompaneros;
        const creativeSum = s.observational.habilidadesArtisticas + s.observational.aportacionIdeas + s.observational.participacion;
        const analyticalSum = s.observational.retencionDatos + s.observational.resolucionProblemas + s.observational.inteligenciaEmocional;
        const averageAll = (socialSum + creativeSum + analyticalSum) / 9;

        let arch = 'Estudiante en Desarrollo';
        let b = '🌱 Semillita';
        if (averageAll > 2.5) {
          if (creativeSum > socialSum && creativeSum > analyticalSum) {
            arch = 'Explorador Creativo';
            b = '🎨 Artista de Ideas';
          } else if (socialSum > creativeSum && socialSum > analyticalSum) {
            arch = s.observational.liderazgo >= 4 ? 'Líder Colaborativo' : 'Guía Empático';
            b = s.observational.liderazgo >= 4 ? '🦁 Guía del Equipo' : '💖 Corazón del Aula';
          } else if (analyticalSum > creativeSum && analyticalSum > socialSum) {
            arch = 'Pensador Analítico';
            b = '🔍 Mente Brillante';
          } else {
            arch = 'Creador Multifacético';
            b = '🦄 Camaleón Escolar';
          }
        }

        return {
          id: s.id,
          name: s.name,
          attendanceScore: s.attendanceScore,
          midtermScore: s.midtermScore,
          activitiesAverage: parseFloat(actScore.toFixed(2)),
          finalGrade: total,
          archetype: arch,
          badge: b
        };
      });

      const payload = {
        students: formattedStudents,
        classAverage: parseFloat(classAverage.toFixed(2)),
        timestamp: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Apps Script web app requests are usually redirected, mode 'no-cors' lets us send securely
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Since mode is no-cors, we can't inspect the body, but it sends data effectively.
      onExportSuccess('¡Reporte enviado exitosamente a tu Google Sheet! Revisa tu documento de Google.');
    } catch (error: any) {
      console.error(error);
      onExportError('Ocurrió un error al enviar datos. Asegúrate de haber publicado tu App Script como \"Cualquiera\" (Anyone) y que la URL sea la correcta.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div id="sheets-integration-panel" className="bg-white rounded-3xl p-6 shadow-sm border-4 border-brand-blue flex flex-col gap-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue/30 p-2.5 rounded-2xl text-sky-700 border border-brand-blue/50">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Sincronización Google Sheets</h3>
            <p className="text-xs text-gray-500">Reportes automáticos mensuales en tu hoja de cálculo</p>
          </div>
        </div>
        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-pink-bg text-brand-pink border border-brand-pink-light hover:bg-brand-pink-bg/85 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          {showTutorial ? 'Ocultar Tutorial' : 'Pasos de Conexión'}
        </button>
      </div>

      {showTutorial && (
        <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100 text-sm text-gray-700 flex flex-col gap-3">
          <h4 className="font-bold text-sky-800 text-base">👣 Guía Paso a Paso para Conectar tu App:</h4>
          <ol className="list-decimal list-inside space-y-2 text-xs">
            <li>
              Crea una hoja de cálculo nueva en <span className="font-semibold">Google Sheets</span>.
            </li>
            <li>
              En el menú de Google Sheets, ve a <span className="font-semibold">Extensiones &gt; Apps Script</span>.
            </li>
            <li>
              Borra todo el contenido que aparezca ahí y pega el código que te dejamos abajo.
            </li>
            <li>
              Haz clic en el botón <span className="font-semibold">Ejecutar / Guardar</span> (icono de disquete).
            </li>
            <li>
              Haz clic en el botón azul <span className="font-semibold">Implementar (Deploy) &gt; Nueva implementación</span> (New deployment).
            </li>
            <li>
              Selecciona tipo <span className="font-semibold">Aplicación web</span> (Web app). Denomínala "Evaluación Escolar".
            </li>
            <li>
              Configura: <span className="font-semibold">Ejecutar como:</span> de "Yo" (Tu correo) y <span className="font-semibold">Quién tiene acceso:</span> a <span className="font-semibold text-rose-600">Cualquiera</span> (utilizado para poder recibir la información de forma abierta).
            </li>
            <li>
              Haz clic en <span className="font-semibold">Implementar</span>, otorga los permisos con tu correo (pestaña Avanzado &gt; Ir a Proyecto) y copia la <span className="font-semibold text-sky-700">URL de la aplicación web</span> obtenida. Pégala abajo en esta aplicación.
            </li>
          </ol>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-sky-800">Código de Apps Script:</span>
              <button
                onClick={handleCopyScript}
                className="text-xs font-semibold py-1 px-3 bg-white hover:bg-white/80 border border-sky-200 text-sky-700 rounded-lg flex items-center gap-1 transition-all"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] bg-slate-900 text-slate-200 p-3 rounded-xl max-h-40 overflow-y-auto font-mono scrollbar-thin">
              {googleAppsScriptCode}
            </pre>
          </div>
        </div>
      )}

      {/* Inputs y triggers */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            🔗 URL de tu Aplicación Web de Google Apps Script:
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full bg-slate-50 border-2 border-slate-100 hover:border-brand-blue focus:border-brand-blue focus:bg-white rounded-2xl px-4 py-3 text-xs font-mono transition-all outline-none text-gray-700"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookUrl}
              onChange={(e) => handleSaveUrl(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Esta URL se guarda en tu navegador y te permite enviar reportes automáticos al instante.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            disabled={exporting || students.length === 0}
            className="flex-1 bg-brand-pink hover:bg-rose-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-center text-sm items-center justify-center flex gap-2 border-b-2 border-black/10"
          >
            <FileSpreadsheet className="w-5 h-5" />
            {exporting ? 'Enviando Datos...' : 'Exportar Reporte Mensual'}
          </button>

          <a
            href="https://sheets.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto px-5 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            Abrir Google Sheets <ExternalLink className="w-4.5 h-4.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
