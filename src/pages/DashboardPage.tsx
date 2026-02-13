import React, { useState, useEffect, useRef } from 'react';
import { CourseCard } from '../components/CourseCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ACADEMY_DATA } from '../data/routesData'; 

// --- SUB-COMPONENTE: EL DISEÑO DEL DIPLOMA ---
const DiplomaTemplate = React.forwardRef<HTMLDivElement, { courseTitle: string; certId: string }>(({ courseTitle, certId }, ref) => (
  <div 
    ref={ref}
    style={{
      width: '800px',
      height: '600px',
      padding: '40px',
      background: '#ffffff',
      border: '15px solid #1e293b',
      position: 'absolute',
      left: '-9999px',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: '#1e293b',
      fontFamily: 'serif'
    }}
  >
    <div style={{ border: '3px solid #fbbf24', width: '100%', height: '100%', padding: '40px', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '42px', margin: 0, color: '#fbbf24' }}>👑 LEVELUP ACADEMY</h1>
      <p style={{ fontSize: '18px', letterSpacing: '4px', marginBottom: '40px' }}>CERTIFICADO DE FINALIZACIÓN</p>
      
      <p style={{ fontSize: '20px', fontStyle: 'italic' }}>Se otorga el presente a un estudiante de excelencia por completar:</p>
      <h2 style={{ fontSize: '36px', margin: '20px 0', color: '#1e293b' }}>{courseTitle}</h2>
      
      <div style={{ marginTop: '60px', width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0 }}><b>Fecha:</b> {new Date().toLocaleDateString()}</p>
          <p style={{ margin: 0, fontSize: '14px' }}><b>ID:</b> {certId}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', borderBottom: '1px solid #1e293b', marginBottom: '5px' }}></div>
          <p style={{ fontSize: '14px' }}>Sello de la Academia</p>
        </div>
      </div>
    </div>
  </div>
));

interface DashboardProps {
  courses: any[];
  favorites: number[];
  completed: number[];
  toggleFavorite: (e: React.MouseEvent, course: any) => void;
  navigateTo: (view: string) => void;
  setSelectedCourse: (course: any) => void;
  setSelectedRoute: (route: any) => void;
}

export const DashboardPage = ({ 
  courses, 
  favorites, 
  completed = [], 
  toggleFavorite, 
  navigateTo, 
  setSelectedCourse,
  setSelectedRoute 
}: DashboardProps) => {
  
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('dashboard_tab');
    if (savedTab) {
      sessionStorage.removeItem('dashboard_tab');
      return 'Certificados'; 
    }
    return 'Favoritos';
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const diplomaRef = useRef<HTMLDivElement>(null);
  const [selectedForCert, setSelectedForCert] = useState({ title: '', id: '' });

  const totalCourses = courses.length;
  const completedCount = completed.length;
  const percentage = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

  const getUserRank = (count: number) => {
    if (count >= 10) return { name: 'Maestro', color: '#fbbf24', icon: '👑' };
    if (count >= 5) return { name: 'Especialista', color: '#8b5cf6', icon: '🔥' };
    if (count >= 2) return { name: 'Aprendiz', color: '#3b82f6', icon: '⚡' };
    return { name: 'Novato', color: '#94a3b8', icon: '🌱' };
  };

  const rank = getUserRank(completedCount);

  const downloadPDF = async (courseTitle: string, certId: string) => {
    setSelectedForCert({ title: courseTitle, id: certId });
    setTimeout(async () => {
      if (!diplomaRef.current) return;
      const canvas = await html2canvas(diplomaRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      pdf.save(`Diploma-${courseTitle}.pdf`);
    }, 150);
  };

  const getFilteredContent = () => {
    switch (activeTab) {
      case 'Favoritos': return courses.filter((c: any) => favorites.includes(c.id));
      case 'Mis Cursos': 
      // CAMBIO AQUÍ: Filtramos para que solo aparezcan los que son favoritos O están completados
      return courses.filter((c: any) => 
        favorites.includes(c.id) || completed.includes(c.id)
      );
      case 'Certificados': return courses.filter((c: any) => completed.includes(c.id));
      case 'Mis Rutas': 
        const allRoutes = Object.values(ACADEMY_DATA).flat();
        return allRoutes.map((route: any) => {
          const doneCount = route.courseIds.filter((id: number) => completed.includes(id)).length;
          const progress = Math.round((doneCount / route.courseIds.length) * 100);
          return { ...route, progress };
        }).filter(r => r.progress > 0); 
      default: return [];
    }
  };

  const filteredContent = getFilteredContent();
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const currentItems = filteredContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  return (
    <div className="container-center" style={{ padding: '60px 0', minHeight: '100vh' }}>
      
      <DiplomaTemplate ref={diplomaRef} courseTitle={selectedForCert.title} certId={selectedForCert.id} />

      {/* Banner de Perfil */}
      <div className="profile-banner-pro" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '40px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '24px', border: `1px solid ${rank.color}44`,
        position: 'relative', overflow: 'hidden', marginBottom: '40px'
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '10rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>
          {rank.icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', zIndex: 1 }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: rank.color, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2.5rem', boxShadow: `0 0 20px ${rank.color}66` 
          }}>
            {rank.icon}
          </div>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '2rem' }}>Mi Dashboard</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
              <span style={{ background: rank.color, color: '#000', padding: '2px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                RANGO: {rank.name}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{completedCount} Cursos completados</span>
            </div>
          </div>
        </div>
        <div style={{ minWidth: '300px', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>XP Acumulada</span>
            <span style={{ color: rank.color, fontWeight: 'bold' }}>{completedCount * 100} XP</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '12px' }}>
            <div style={{ width: `${percentage}%`, background: rank.color, height: '100%', borderRadius: '10px', transition: 'width 1s ease' }}></div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="dashboard-tabs">
        {['Mis Cursos', 'Mis Rutas', 'Favoritos', 'Certificados'].map((tab) => (
          <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </div>
        ))}
      </div>

      <h3 className="white-text" style={{ margin: '30px 0' }}>{activeTab}</h3>
      
      {activeTab === 'Certificados' && (
        <div className="specialty-certificates" style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '20px' }}>🏅 Diplomas de Especialización</h2>
          {Object.values(ACADEMY_DATA).flat().map((route: any) => {
            const isRouteComplete = route.courseIds.every((id: number) => completed.includes(id));
            if (!isRouteComplete) return null;

            return (
              <div key={route.id} className="premium-cert-row" style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                display: 'flex', flexDirection: 'row', alignItems: 'center', 
                padding: '25px 40px', border: '3px solid #fbbf24', marginBottom: '25px',
                borderRadius: '16px', width: '100%', boxSizing: 'border-box',
                boxShadow: '0 10px 30px rgba(251, 191, 36, 0.2)'
              }}>
                <div style={{ fontSize: '3.5rem', marginRight: '25px' }}>🏆</div>
                <div style={{ flexGrow: 1 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1rem', display: 'block' }}>ESPECIALISTA MASTER</span>
                  <h3 style={{ color: '#ffffff', fontSize: '2rem', margin: 0 }}>{route.title}</h3>
                  <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Ruta de aprendizaje profesional completada</p>
                </div>
                <button 
                  onClick={() => downloadPDF(`Especialista en ${route.title}`, `ROUTE-${route.id}`)}
                  style={{ background: '#fbbf24', color: '#000', border: 'none', padding: '15px 30px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
                >
                  DESCARGAR DIPLOMA ORO
                </button>
              </div>
            );
          })}
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0' }} />
          <h2 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '20px' }}>Cursos Individuales</h2>
        </div>
      )}

      {currentItems.length > 0 ? (
        <div className={activeTab === 'Certificados' ? "certificates-column" : "jobs-list"}>
          {currentItems.map((item: any) => {
            if (activeTab === 'Mis Rutas') {
              return (
                <div key={item.id} className="route-progress-card" style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  padding: '30px', borderRadius: '20px', border: '1px solid #334155',
                  marginBottom: '20px', width: '100%', boxSizing: 'border-box',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>RUTA EN CURSO</span>
                      <h3 style={{ color: 'white', margin: '5px 0 0 0', fontSize: '1.5rem' }}>{item.title}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: '900' }}>{item.progress}%</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', marginBottom: '20px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${item.progress}%`, background: '#4ade80', height: '100%', borderRadius: '6px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)'
                    }}></div>
                  </div>
                  <button 
                    onClick={() => { setSelectedRoute(item); navigateTo('path-detail'); }}
                    style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', color: '#4ade80', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    CONTINUAR ESTA RUTA →
                  </button>
                </div>
              );
            }

            if (activeTab === 'Certificados') {
              return (
                <div key={item.id} className="premium-cert-row" style={{ 
                    background: '#2d3748', display: 'flex', flexDirection: 'row', alignItems: 'center', 
                    padding: '20px 40px', border: '2px solid #fbbf24', marginBottom: '15px',
                    borderRadius: '12px', width: '100%', boxSizing: 'border-box'
                }}>
                  <div style={{ fontSize: '3rem', marginRight: '20px' }}>👑</div>
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}>CERTIFICADO OFICIAL</span>
                    <h3 style={{ color: '#ffffff', fontSize: '1.8rem', margin: 0 }}>{item.title}</h3>
                  </div>
                  <button 
                    onClick={() => downloadPDF(item.title, `LUP-${item.id}`)}
                    style={{ background: '#4ade80', color: '#0f172a', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    DESCARGAR PDF
                  </button>
                </div>
              );
            }

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <CourseCard 
                  course={item} 
                  isFavorite={favorites.includes(item.id)} 
                  onFavorite={toggleFavorite} 
                  onClick={() => { setSelectedCourse(item); navigateTo('course-detail') }} 
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px', background: '#1e293b', borderRadius: '20px', border: '1px dashed #334155' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📁</div>
          <p className="white-text" style={{ fontSize: '1.2rem', opacity: 0.7 }}>No hay contenido disponible en <strong>{activeTab}</strong> todavía.</p>
          <button onClick={() => navigateTo('explorer')} style={{ marginTop: '20px', background: '#4ade80', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Explorar Cursos
          </button>
        </div>
      )}

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '50px', paddingBottom: '40px' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ background: '#1e293b', color: currentPage === 1 ? '#475569' : '#4ade80', border: '1px solid #334155', padding: '10px 15px', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          > ← </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: currentPage === i + 1 ? '#4ade80' : '#1e293b', color: currentPage === i + 1 ? '#0f172a' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}
            > {i + 1} </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ background: '#1e293b', color: currentPage === totalPages ? '#475569' : '#4ade80', border: '1px solid #334155', padding: '10px 15px', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          > → </button>
        </div>
      )}
    </div>
  );
};