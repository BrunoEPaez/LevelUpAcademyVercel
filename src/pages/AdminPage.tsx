import React, { useState, useEffect } from 'react';
import axios from 'axios';

const extractYoutubeId = (url: string) => {
  // Si el usuario pegó directamente el ID (11 caracteres), lo devolvemos tal cual
  if (url.length === 11) return url;

  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  // Si hay coincidencia y tiene 11 caracteres, lo devolvemos
  if (match && match[7] && match[7].length === 11) {
    return match[7];
  }
  
  // Si todo falla, intentamos una búsqueda simple por parámetro 'v='
  const urlParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
  const vParam = urlParams.get('v');
  if (vParam && vParam.length === 11) return vParam;

  // Si realmente no es un link de YouTube, devolvemos el valor original 
  // para no romperlo, o el de seguridad
  return url || "dQw4w9WgXcQ"; 
};


const AdminPage: React.FC<{ token: string | null }> = ({ token }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'paths'>('videos');
  const [filter, setFilter] = useState('');
  
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingPathId, setEditingPathId] = useState<number | null>(null);

  const [course, setCourse] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    youtube_id: '',
    instructor: 'Admin LevelUp'
  });

  const [pathForm, setPathForm] = useState({
    title: '',
    description: '',
    color: '#4ade80',
    selectedVideos: [] as number[] 
  });

  const [status, setStatus] = useState({ msg: '', type: '' });

  // --- LÓGICA DE FUNCIONES ---
  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newVideos = [...pathForm.selectedVideos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newVideos.length) return;
    
    [newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]];
    setPathForm({ ...pathForm, selectedVideos: newVideos });
  };

  const fetchData = async () => {
    try {
      const resCourses = await axios.get('http://localhost:3001/api/courses');
      setCourses(resCourses.data);
      const resPaths = await axios.get('http://localhost:3001/api/paths');
      setPaths(resPaths.data);
    } catch (err) {
      console.error("Error cargando datos");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- NUEVA LÓGICA DE ELIMINACIÓN ---
  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este video de la biblioteca?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:3001/api/admin/courses/${id}`, config);
      fetchData();
      setStatus({ msg: 'Video eliminado', type: 'success' });
    } catch (err) {
      setStatus({ msg: 'Error al eliminar video', type: 'error' });
    }
  };

  const handleDeletePath = async (id: number) => {
    if (!window.confirm('¿Borrar esta ruta? Los videos no se borrarán, solo la carrera.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:3001/api/admin/paths/${id}`, config);
      fetchData();
      setStatus({ msg: 'Ruta eliminada', type: 'success' });
    } catch (err) {
      setStatus({ msg: 'Error al eliminar ruta', type: 'error' });
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // IMPORTANTE: Limpiamos el ID justo antes de enviar
  const videoId = extractYoutubeId(course.youtube_id);
  
  const courseData = { 
    ...course, 
    youtube_id: videoId,
    thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
  };

  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (editingCourseId) {
      await axios.put(`http://localhost:3001/api/admin/courses/${editingCourseId}`, courseData, config);
      setStatus({ msg: 'Video actualizado', type: 'success' });
    } else {
      await axios.post('http://localhost:3001/api/admin/courses', courseData, config);
      setStatus({ msg: 'Video creado', type: 'success' });
    }
    
    // Limpiar campos y refrescar
    setCourse({ title: '', description: '', thumbnail_url: '', youtube_id: '', instructor: 'Admin LevelUp' });
    setEditingCourseId(null);
    fetchData();
  } catch (err: any) {
    setStatus({ msg: 'Error al guardar el video', type: 'error' });
  }
};

  const handlePathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const pathBasicData = {
      title: pathForm.title,
      description: pathForm.description,
      color: pathForm.color || '#4ade80'
    };

    try {
      let currentId = editingPathId;
      if (editingPathId) {
        await axios.put(`http://localhost:3001/api/admin/paths/${editingPathId}`, pathBasicData, config);
      } else {
        const res = await axios.post('http://localhost:3001/api/admin/paths', pathBasicData, config);
        currentId = res.data.id;
      }
      await axios.post(`http://localhost:3001/api/paths/${currentId}/courses`, {
        videoIds: pathForm.selectedVideos
      }, config);

      resetPathForm();
      fetchData();
      setStatus({ msg: '¡Ruta y videos actualizados!', type: 'success' });
    } catch (err: any) {
      setStatus({ msg: 'Error al guardar', type: 'error' });
    }
  };

  const startEditPath = async (p: any) => {
    setEditingPathId(p.id);
    try {
      const res = await axios.get(`http://localhost:3001/api/paths/${p.id}/courses`);
      const assignedIds = res.data.map((c: any) => c.id);
      setPathForm({ 
        title: p.title, 
        description: p.description || '', 
        color: p.color || '#4ade80',
        selectedVideos: assignedIds 
      });
    } catch (err) {
      setPathForm({ title: p.title, description: p.description || '', color: p.color || '#4ade80', selectedVideos: [] });
    }
    setActiveTab('paths');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleVideoInPath = (videoId: number) => {
    setPathForm(prev => ({
      ...prev,
      selectedVideos: prev.selectedVideos.includes(videoId)
        ? prev.selectedVideos.filter(id => id !== videoId)
        : [...prev.selectedVideos, videoId]
    }));
  };

  const resetPathForm = () => {
    setEditingPathId(null);
    setPathForm({ title: '', description: '', color: '#4ade80', selectedVideos: [] });
  };

  return (
    <div className="admin-container" style={{ padding: '40px', color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#4ade80', margin: 0 }}>Panel de Control 🛠️</h1>
        {status.msg && <div style={{marginTop: '10px', color: status.type === 'success' ? '#4ade80' : '#f87171'}}>{status.msg}</div>}
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button onClick={() => setActiveTab('videos')} style={{ ...tabBtnStyle, background: activeTab === 'videos' ? '#4ade80' : '#1e293b', color: activeTab === 'videos' ? '#000' : '#fff' }}> 📹 Gestionar Videos </button>
          <button onClick={() => setActiveTab('paths')} style={{ ...tabBtnStyle, background: activeTab === 'paths' ? '#a855f7' : '#1e293b', color: '#fff' }}> 🛤️ Constructor de Rutas </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        <section style={formContainerStyle}>
          {activeTab === 'videos' ? (
            <form onSubmit={handleCourseSubmit}>
              <h2 style={{ color: '#a855f7' }}>{editingCourseId ? 'Editar Video' : 'Nuevo Video'}</h2>
              <input style={inputStyle} value={course.title} onChange={e => setCourse({...course, title: e.target.value})} placeholder="Título del video" required />
              <input style={inputStyle} value={course.youtube_id} onChange={e => setCourse({...course, youtube_id: e.target.value})} placeholder="ID de YouTube" required />
              <textarea style={{...inputStyle, height: '100px'}} value={course.description} onChange={e => setCourse({...course, description: e.target.value})} placeholder="Descripción técnica" />
              <button type="submit" style={submitBtnStyle('#4ade80')}>{editingCourseId ? 'GUARDAR CAMBIOS' : 'CREAR VIDEO'}</button>
            </form>
          ) : (
            <form onSubmit={handlePathSubmit}>
              <h2 style={{ color: '#4ade80' }}>{editingPathId ? 'Editando Ruta' : 'Nueva Ruta'}</h2>
              <input style={inputStyle} value={pathForm.title} onChange={e => setPathForm({...pathForm, title: e.target.value})} placeholder="Nombre de la Carrera/Ruta" required />
              <input type="color" style={{...inputStyle, height: '40px', padding: '2px'}} value={pathForm.color} onChange={e => setPathForm({...pathForm, color: e.target.value})} />
              
              <h3 style={{ fontSize: '1rem', marginTop: '20px', color: '#a855f7' }}>Seleccionar videos:</h3>
              <div style={videoSelectorStyle}>
                {courses.map(c => (
                  <div key={c.id} onClick={() => toggleVideoInPath(c.id)} style={{...videoOptionStyle, borderColor: pathForm.selectedVideos.includes(c.id) ? '#4ade80' : '#334155', background: pathForm.selectedVideos.includes(c.id) ? '#065f4633' : 'transparent'}}>
                    <input type="checkbox" checked={pathForm.selectedVideos.includes(c.id)} readOnly />
                    <span style={{ fontSize: '0.8rem' }}>{c.title}</span>
                  </div>
                ))}
              </div>

              {pathForm.selectedVideos.length > 0 && (
                <div style={{ marginTop: '10px', border: '1px solid #334155', padding: '10px', borderRadius: '8px', background: '#1e293b' }}>
                  <h4 style={{margin: '0 0 10px 0'}}>Orden de la ruta:</h4>
                  {pathForm.selectedVideos.map((id, index) => {
                    const v = courses.find(c => c.id === id);
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', borderBottom: '1px solid #334155' }}>
                        <span style={{fontSize: '0.8rem'}}>{index + 1}. {v?.title}</span>
                        <div>
                          <button type="button" onClick={() => moveVideo(index, 'up')} style={miniBtnStyle}>↑</button>
                          <button type="button" onClick={() => moveVideo(index, 'down')} style={miniBtnStyle}>↓</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button type="submit" style={{...submitBtnStyle('#a855f7'), marginTop: '20px'}}>
                {editingPathId ? 'ACTUALIZAR RUTA' : 'CREAR RUTA CON VIDEOS'}
              </button>
              {editingPathId && <button onClick={resetPathForm} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', width:'100%', marginTop:'10px'}}>Cancelar</button>}
            </form>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={listBlockStyle('#a855f7')}>
            <h3>Tracks Activos</h3>
            {paths.map(p => (
              <div key={p.id} style={{ ...cardStyle, marginBottom: '8px', borderLeft: `4px solid ${p.color}` }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{p.title}</p>
                  <small>{p.video_count || 0} videos</small>
                </div>
                <button onClick={() => startEditPath(p)} style={actionBtnStyle('#3b82f6')}>✏️</button>
                {/* BOTÓN ELIMINAR RUTA */}
                <button onClick={() => handleDeletePath(p.id)} style={actionBtnStyle('#f87171')}>🗑️</button>
              </div>
            ))}
          </div>

          <div style={listBlockStyle('#1e293b')}>
            <h3>Biblioteca</h3>
            <input placeholder="Filtrar..." style={{...miniInputStyle, width: '100%', marginBottom: '10px'}} value={filter} onChange={e => setFilter(e.target.value)} />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {courses.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())).map(c => (
                <div key={c.id} style={{...cardStyle, marginBottom: '5px'}}>
                  <span style={{flex: 1, fontSize: '0.8rem'}}>{c.title}</span>
                  <button onClick={() => {setEditingCourseId(c.id); setCourse({...c}); setActiveTab('videos');}} style={actionBtnStyle('#3b82f6')}>✏️</button>
                  {/* BOTÓN ELIMINAR VIDEO */}
                  <button onClick={() => handleDeleteCourse(c.id)} style={actionBtnStyle('#f87171')}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const tabBtnStyle = { padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: 'bold' as const };
const formContainerStyle = { background: '#0f172a', padding: '30px', borderRadius: '20px', border: '1px solid #1e293b' };
const inputStyle = { width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', marginBottom: '15px' };
const submitBtnStyle = (bg: string) => ({ width: '100%', padding: '15px', background: bg, color: '#000', fontWeight: 'bold' as const, border: 'none', borderRadius: '10px', cursor: 'pointer' });
const listBlockStyle = (borderColor: string) => ({ background: '#0f172a', padding: '25px', borderRadius: '20px', border: `1px solid ${borderColor}` });
const cardStyle = { display: 'flex', alignItems: 'center', padding: '12px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' };
const actionBtnStyle = (color: string) => ({ background: 'none', border: `1px solid ${color}`, color, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', marginLeft: '8px' });
const miniBtnStyle = { background: '#334155', color: 'white', border: 'none', padding: '2px 8px', marginLeft: '4px', borderRadius: '4px', cursor: 'pointer' };
const videoSelectorStyle = { maxHeight: '200px', overflowY: 'auto' as const, border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginBottom: '10px', display: 'flex', flexDirection: 'column' as const, gap: '5px' };
const videoOptionStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', border: '1px solid transparent', borderRadius: '6px', cursor: 'pointer' };
const miniInputStyle = { padding: '8px 15px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' };

export default AdminPage;