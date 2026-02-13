import AdminPage from './pages/AdminPage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { YouTubeEmbed } from './components/YouTubeEmbed';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { ExplorerPage } from './pages/ExplorerPage';
import ProfilePage from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PathDetailPage } from './pages/PathDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { AIAssistant } from './components/AIAssistant';
import { DashboardPage } from './pages/DashboardPage';
import confetti from 'canvas-confetti';
import { ACADEMY_DATA } from './data/routesData';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const App: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [view, setView] = useState<any>(localStorage.getItem('lastView') || 'landing');
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');
  
  const [selectedCourse, setSelectedCourse] = useState<any>(() => {
    const saved = localStorage.getItem('selectedCourse');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedRoute, setSelectedRoute] = useState<any>(() => {
    const saved = localStorage.getItem('selectedRoute');
    return saved ? JSON.parse(saved) : null;
  });

  const [favorites, setFavorites] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = async (courseId: number) => {
  if (!token) {
    alert("Inicia sesión para guardar tu progreso.");
    navigateTo('login');
    return;
  }

  // Optimistic UI: Cambiamos el estado visual antes de la respuesta del servidor
  const isNowCompleted = !completed.includes(courseId);
  
  if (isNowCompleted) {
    setCompleted(prev => [...prev, courseId]);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  } else {
    setCompleted(prev => prev.filter(id => id !== courseId));
  }

  try {
    await axios.post('/api/progress', 
      { course_id: courseId, action_type: 'completed' }, // Importante enviar el tipo
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Error al guardar progreso");
  }
};

  // Función para seleccionar curso cargando sus datos reales de la API
const handleSelectCourse = async (course: any) => {
  try {
    // Intentamos traer datos frescos del servidor
    const res = await axios.get(`/api/courses/${course.id}`);
    setSelectedCourse(res.data);
    localStorage.setItem('selectedCourse', JSON.stringify(res.data));
    navigateTo('course-detail');
  } catch (error) {
    console.warn("La API falló, usando datos locales...");
    // PLAN B: Si la API falla, usamos el objeto 'course' que ya tenemos
    setSelectedCourse(course);
    localStorage.setItem('selectedCourse', JSON.stringify(course));
    navigateTo('course-detail');
  }
};

useEffect(() => {
  // 1. Recuperar vista
  const savedView = localStorage.getItem('lastView');
  if (savedView) setView(savedView);

  // 2. Recuperar Ruta (con comprobación de seguridad)
  const savedRoute = localStorage.getItem('selectedRoute');
  if (savedRoute && savedRoute !== "undefined" && savedRoute !== "null") {
    try {
      setSelectedRoute(JSON.parse(savedRoute));
    } catch (e) { console.error("Error parseando ruta"); }
  }

  // 3. Recuperar Curso (Esto evitará que se quede en blanco o salte al landing)
  const savedCourse = localStorage.getItem('selectedCourse');
  if (savedCourse && savedCourse !== "undefined" && savedCourse !== "null") {
    try {
      setSelectedCourse(JSON.parse(savedCourse));
    } catch (e) { console.error("Error parseando curso"); }
  }
}, []);

useEffect(() => {
  // Si la vista guardada es detalle pero no hay curso en memoria, 
  // redirigimos al explorer para evitar pantalla en blanco
  if (view === 'course-detail' && !selectedCourse) {
    navigateTo('explorer');
  }
}, []);



useEffect(() => {
  if (token) {
    // Cargar cursos completados desde el backend
    axios.get('/api/progress', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Suponiendo que el backend devuelve un array de IDs: [1, 5, 8]
      setCompleted(res.data.completedCourseIds); 
      setFavorites(res.data.favoriteIds);
    })
    .catch(() => console.log("Error cargando progreso del usuario"));
  }
}, [token]);

  const handleNextCourse = (currentCourseId: number) => {
  // BLOQUEO DE SEGURIDAD
  if (!token) {
    alert("Debes estar registrado para avanzar en las rutas de aprendizaje.");
    navigateTo('login');
    return;
  }

  if (!completed.includes(currentCourseId)) {
    toggleCompleted(currentCourseId);
  }

  const allRoutes = Object.values(ACADEMY_DATA).flat();
  const currentRouteInDato = allRoutes.find(route => route.courseIds.includes(currentCourseId));

  if (currentRouteInDato) {
    const currentIndex = currentRouteInDato.courseIds.indexOf(currentCourseId);
    const nextCourseId = currentRouteInDato.courseIds[currentIndex + 1];

    if (nextCourseId) {
      const nextCourse = courses.find(c => c.id === nextCourseId);
      if (nextCourse) {
        setSelectedCourse(nextCourse);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigateTo('path-detail');
    }
  }
};

  const handleLogin = async (credentials: any) => {
  try {
    const res = await axios.post('/api/login', { user: credentials });
    const authToken = res.data.token;
    
    // MEJORA: Si user.name es nulo, sacamos el nombre del email (emmanuel)
    const rawName = res.data.user?.name;
    const emailName = res.data.user?.email ? res.data.user.email.split('@')[0] : "Estudiante";
    const name = rawName || emailName; 

    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('userName', name); // Guardamos el nombre real
      
      setToken(authToken);
      setUserName(name);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      alert(`¡Bienvenido, ${name}!`);
      navigateTo('dashboard');
    }
  } catch (err: any) {
    alert("Error: " + (err.response?.data?.error || "Credenciales inválidas"));
  }
};
  const handleRegister = async (userData: any) => {
    try {
      await axios.post('/api/register', { user: userData });
      alert("¡Cuenta creada con éxito!");
      navigateTo('login');
    } catch (err: any) {
      alert(err.response?.data?.errors?.join(", ") || "Error en el registro");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    navigateTo('landing');
  };


  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => setView(event.state?.view || 'landing');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView: string, data: any = null) => {
  window.history.pushState({ view: newView }, '');
  setView(newView);
  localStorage.setItem('lastView', newView);

  if (newView === 'course-detail' && data) {
    setSelectedCourse(data);
    localStorage.setItem('selectedCourse', JSON.stringify(data));
  }
  
  if (newView === 'path-detail' && data) {
    setSelectedRoute(data);
    localStorage.setItem('selectedRoute', JSON.stringify(data));
  }
  window.scrollTo(0, 0);
};
  
  useEffect(() => {
  const fetchData = async () => {
    try {
      // 1. Cargamos TODOS los cursos de la DB
      const resCourses = await axios.get('/api/courses');
      setCourses(resCourses.data);

      // 2. Si hay token, traemos el progreso
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const resProgress = await axios.get('/api/progress', config);
        setCompleted(resProgress.data.completedCourseIds || []);
        setFavorites(resProgress.data.favoriteIds || []);
      }
    } catch (err: any) {
      if (err.response?.status === 401) handleLogout();
    }
  };
  fetchData();
}, [token]); // Se recarga si el usuario loguea/desloguea
  

  const toggleFavorite = async (e: React.MouseEvent, course: any) => {
    e.stopPropagation();
    if (!token) return navigateTo('login');

    // 1. Cambio visual rápido
    setFavorites(prev => 
      prev.includes(course.id) ? prev.filter(id => id !== course.id) : [...prev, course.id]
    );

    // 2. Guardar en Backend
    try {
      await axios.post('/api/progress', 
        { course_id: course.id, action_type: 'favorite' }, // Enviamos action_type para que el backend sepa qué hacer
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      console.error("Error al guardar favorito");
    }
  };

  const displayCourses = (Array.isArray(courses) ? courses : []).filter((course: any) => {
  // También protegemos el título por si algún curso viene mal cargado
  const title = course.title || ""; 
  const matchesText = title.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCat = catFilter === 'Todos' || course.category === catFilter || course.job_type === catFilter;
  return matchesText && matchesCat;
});

  const downloadPDF = async (courseTitle: string) => {
    const element = document.getElementById('diploma-to-print');
    if (!element) {
      alert("Por favor, abre tu Dashboard primero para cargar la plantilla de certificados.");
      return;
    }
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      pdf.save(`Certificado-${courseTitle}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  return (
    <div className="app-layout education-theme">
      <NavBar 
  navigateTo={navigateTo} 
  token={token} 
  handleLogout={handleLogout} 
  userName={userName} // <--- Asegurate de que esta línea esté ahí
/>

      <main className="main-content">
        {view === 'landing' && (
          <LandingPage 
            courses={courses} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
            navigateTo={navigateTo} 
            setSelectedCourse={handleSelectCourse} 
          />
        )}

        {view === 'categories' && (
          <CategoriesPage 
            courses={courses} 
            completed={completed}
            setSelectedRoute={setSelectedRoute} 
            navigateTo={navigateTo} 
          />
        )}

        {view === 'path-detail' && selectedRoute && (
  <PathDetailPage 
    selectedRoute={selectedRoute}
    // FILTRO CLAVE: Pasamos solo los cursos que coinciden con el título de la ruta seleccionada
    courses={courses.filter(c => c.category === selectedRoute.title)} 
    completed={completed}
    favorites={favorites}
    toggleFavorite={toggleFavorite}
    navigateTo={navigateTo}
    setSelectedCourse={handleSelectCourse}
    downloadPDF={downloadPDF}
  />
)}

        {view === 'explorer' && (
          <ExplorerPage 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            catFilter={catFilter} 
            setCatFilter={setCatFilter} 
            filteredCourses={displayCourses} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
            navigateTo={navigateTo} 
            setSelectedCourse={handleSelectCourse}
            onSearch={() => console.log(searchTerm)}
          />
        )}

        {view === 'dashboard' && (
          <DashboardPage 
            courses={courses} 
            favorites={favorites} 
            completed={completed} 
            toggleFavorite={toggleFavorite} 
            navigateTo={navigateTo} 
            setSelectedCourse={handleSelectCourse}
            setSelectedRoute={setSelectedRoute}
          />
        )}

        {/* --- NUEVA VISTA DE ADMINISTRADOR --- */}
        {view === 'admin' && <AdminPage token={token} />}

        {view === 'course-detail' && selectedCourse && (
          <div className="container-center mt-40">
            <div className="job-detail-card" style={{ background: '#1a1a2e', padding: '40px', borderRadius: '20px', border: '1px solid #334155' }}>
              <button 
                className="white-text" 
                style={{ color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }} 
                onClick={() => navigateTo('explorer')}
              >
                ← Volver al Explorador
              </button>
              
              <div className="video-container" style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '15px', overflow: 'hidden' }}>
  {selectedCourse.youtube_id ? (
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${selectedCourse.youtube_id}?autoplay=1&rel=0`}
      title={selectedCourse.title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
      <span style={{ fontSize: '3rem' }}>🚫</span>
      <p>Este curso no tiene un ID de video configurado en el Admin.</p>
    </div>
  )}
</div>
              
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="white-text" style={{ fontSize: '2rem' }}>{selectedCourse.title}</h1>
                
                {/* Botón de completar */}
                {!completed.includes(selectedCourse.id) && (
                  <button 
                    onClick={() => toggleComplete(selectedCourse.id)}
                    className="btn-primary-levelup"
                    style={{ padding: '10px 20px' }}
                  >
                    MARCAR COMO COMPLETADO
                  </button>
                )}
              </div>
              <p className="white-text" style={{ marginTop: '20px', opacity: 0.8, lineHeight: '1.6' }}>
                {selectedCourse.description}
              </p>
            </div>
          </div>
        )}

        {view === 'profile' && <ProfilePage token={token} handleLogout={handleLogout} />}
        {view === 'login' && <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />}
        {view === 'register' && <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />}
        {view === 'courses' && (
        <CoursesPage 
         courses={courses} 
          favorites={favorites} 
          toggleFavorite={toggleFavorite} 
          navigateTo={navigateTo} 
          setSelectedCourse={handleSelectCourse} // Usamos handleSelectCourse aquí también para consistencia
        />
        )}

      </main>

      <AIAssistant selectedCourse={selectedCourse} />

      <footer className="main-footer">
        <div className="container-center">
          <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', textAlign: 'center'}}>© 2025 LevelUp Academy</p>
        </div>
      </footer>
    </div>
  );
};


export default App;