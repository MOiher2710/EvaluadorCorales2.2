
import React, { useState, useEffect, useMemo } from 'react';
const BASE = import.meta.env.BASE_URL;   // obtiene la base del proyecto (Ej: /EvaluadorCorales2.2/)
const LOGO_HEADER = `${BASE}logo.jpg`;   // arma la ruta completa para logo.png

const CRITERIOS=['Creatividad en la composición','Calidad de interpretación','Desenvolvimiento escénico','Ritmo y armonía','Mensaje de la canción'];

function TopBar({ eventName, setView, view }){
  const BASE = import.meta.env.BASE_URL;
  const LOGO_HEADER = `${BASE}logo.jpg`; // 👈 usamos el .jpg de cabecera

  return (
    <header className="topbar">
      <div className="brand" onClick={() => setView('home')}>
        <img src={LOGO_HEADER} alt="Festival de Corales" />
        <div className="brand-text">
          <strong>{eventName}</strong>
          <small>{view === 'final' ? 'Resultados finales' : 'Evaluación'}</small>
        </div>
      </div>
    </header>
  );
}


function generatePIN(){ return Math.floor(1000 + Math.random()*9000).toString(); }

export default function App(){
  const [view,setView]=useState('home'); // home | admin | jurado | final
  const [adminLogueado,setAdminLogueado]=useState(false);
  const [evento,setEvento]=useState(()=>localStorage.getItem('evento')||'Festival de Corales');
  const [agrupaciones,setAgrupaciones]=useState(()=>JSON.parse(localStorage.getItem('agrupaciones'))||[]);
  const [jurados,setJurados]=useState(()=>JSON.parse(localStorage.getItem('jurados_v2'))||[]); // {name,pin}
  const [evaluaciones,setEvaluaciones]=useState(()=>JSON.parse(localStorage.getItem('evaluaciones'))||{});
  const [bloqueado,setBloqueado]=useState(()=>JSON.parse(localStorage.getItem('bloqueado'))||false);
  const [juradoActivo,setJuradoActivo]=useState(null);

  useEffect(()=>{
    localStorage.setItem('evento', evento);
    localStorage.setItem('agrupaciones', JSON.stringify(agrupaciones));
    localStorage.setItem('jurados_v2', JSON.stringify(jurados));
    localStorage.setItem('evaluaciones', JSON.stringify(evaluaciones));
    localStorage.setItem('bloqueado', JSON.stringify(bloqueado));
  },[evento,agrupaciones,jurados,evaluaciones,bloqueado]);

  const tablaTotales = useMemo(()=>{
    const tot = {};
    for(const key of Object.keys(evaluaciones||{})){
      const evalJ = evaluaciones[key]||{};
      for(const ag of Object.keys(evalJ)){
        const fila = evalJ[ag]||{};
        const sum = Object.values(fila).reduce((a,b)=>a+(Number(b)||0),0);
        tot[ag] = (tot[ag]||0) + sum;
      }
    }
    (agrupaciones||[]).forEach(ag=>{ if(!(ag in tot)) tot[ag]=0; });
    return Object.entries(tot).sort((a,b)=>{
      if(b[1]!==a[1]) return b[1]-a[1];
      return a[0].localeCompare(b[0],'es',{sensitivity:'base'});
    });
  },[evaluaciones,agrupaciones]);

  const loginAdmin=k=>k==='admin123'?setAdminLogueado(true):alert('Clave incorrecta');

  let jurInputRef=null, agrInputRef=null;

  const agregarJurado=()=>{
    const n = (jurInputRef?.value || '').trim(); if(!n) return;
    if(jurados.some(j=>j.name===n)) return alert('Ese jurado ya existe');
    const pin = generatePIN();
    setJurados(prev=>[...prev,{name:n,pin}]);
    alert('Jurado agregado: '+n+'  PIN: '+pin);
    if(jurInputRef){ jurInputRef.value=''; jurInputRef.focus(); }
  };
  const eliminarJurado=(name)=>setJurados(jurados.filter(j=>j.name!==name));

  const agregarAgrupacion=()=>{
    const n = (agrInputRef?.value || '').trim(); if(!n) return;
    if(agrupaciones.length>=15) return alert('Máximo 15 agrupaciones');
    if(agrupaciones.includes(n)) return alert('Ya existe');
    setAgrupaciones(prev=>[...prev,n]);
    if(agrInputRef){ agrInputRef.value=''; agrInputRef.focus(); }
  };
  const eliminarAgrupacion=(n)=>setAgrupaciones(agrupaciones.filter(a=>a!==n));

  const evaluar=(ag,c,v)=>{
    if(v==='') v='';
    const num=Number(v); if(num<0||num>5) return;
    const key=juradoActivo.name;
    const actual=evaluaciones[key]||{};
    const nueva={...actual,[ag]:{...(actual[ag]||{}),[c]: v===''?'':num }};
    setEvaluaciones({...evaluaciones,[key]:nueva});
  };

  const reiniciar=()=>{
    if(window.confirm('¿Seguro que deseas reiniciar el concurso?')){
      setJurados([]); setAgrupaciones([]); setEvaluaciones({});
      setEvento('Festival de Corales'); setBloqueado(false);
      setAdminLogueado(false); setView('home'); setJuradoActivo(null);
    }
  };

  if(view==='home'){
    return (
      <div className='wrap home'>
        <TopBar eventName={evento} setView={setView} view={view}/>
        <div className='content'>
          <h1>Bienvenido</h1>
          <div className='actions'>
            <button onClick={()=>setView('admin')}>Entrar como Administrador</button>
            <button onClick={()=>setView('jurado')}>Entrar como Jurado</button>
            <button className='secondary' onClick={()=>setView('final')}>Ver Resultados</button>
          </div>
        </div>
      </div>
    );
  }

  if(view==='admin' && !adminLogueado){
    let r;
    return (
      <div className='wrap'>
        <TopBar eventName={evento} setView={setView} view={view}/>
        <div className='content'>
          <h2>Login Administrador</h2>
          <input ref={x=>r=x} type='password' placeholder='Clave (admin123)' onKeyDown={e=>e.key==='Enter'&&loginAdmin(e.target.value)}/>
          <button onClick={()=>loginAdmin(r?.value||'')}>Ingresar</button>
          <button className='secondary' onClick={()=>setView('home')}>Volver</button>
        </div>
      </div>
    );
  }

  if(view==='admin'){
    return (
      <div className='wrap'>
        <TopBar eventName={evento} setView={setView} view={view}/>
        <div className='content'>
          <h2>Panel de Administración</h2>
          <label className='label'>Nombre del evento</label>
          <input value={evento} onChange={e=>setEvento(e.target.value)} placeholder='Nombre del evento'/>

          <div className='grid2'>
            <div>
              <h3>Jurados</h3>
              <div className='row'>
                <input ref={x=>jurInputRef=x} placeholder='Nombre del jurado' onKeyDown={e=>e.key==='Enter'&&agregarJurado()}/>
                <button onClick={agregarJurado}>Agregar</button>
              </div>
              <ul className='list'>
                {jurados.map(j=>(
                  <li key={j.name}>
                    <span>{j.name} — <code>PIN: {j.pin}</code></span>
                    <button className='danger' onClick={()=>eliminarJurado(j.name)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Agrupaciones (máx 15)</h3>
              <div className='row'>
                <input ref={x=>agrInputRef=x} placeholder='Nombre de la agrupación' onKeyDown={e=>e.key==='Enter'&&agregarAgrupacion()}/>
                <button onClick={agregarAgrupacion}>Agregar</button>
              </div>
              <ul className='list'>
                {agrupaciones.map(a=>(
                  <li key={a}><span>{a}</span><button className='danger' onClick={()=>eliminarAgrupacion(a)}>Eliminar</button></li>
                ))}
              </ul>
            </div>
          </div>

          <div className='row'>
            <button onClick={()=>setBloqueado(!bloqueado)}>{bloqueado?'Desbloquear':'Bloquear'} Evaluación</button>
            <button className='danger' onClick={reiniciar}>Reiniciar Concurso</button>
            <button className='secondary' onClick={()=>setView('home')}>Salir</button>
            <button onClick={()=>setView('final')}>Ver resultados finales</button>
          </div>

          <h3>Totales por agrupación (suma de jurados)</h3>
          <div className='table-wrap'>
            <table>
              <thead><tr><th>#</th><th>Agrupación</th><th>Total</th></tr></thead>
              <tbody>
                {tablaTotales.map(([ag, total], idx)=>(
                  <tr key={ag} className={idx===0?'gold':idx===1?'silver':idx===2?'bronze':''}>
                    <td>{idx+1}</td><td className='left'>{ag}</td><td><strong>{total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if(view==='jurado' && !juradoActivo){
    let selected=null, pinRef;
    return (
      <div className='wrap'>
        <TopBar eventName={evento} setView={setView} view={view}/>
        <div className='content'>
          <h2>Identifícate</h2>
          <p>Selecciona tu nombre y escribe tu PIN para continuar.</p>
          <div className='row'>
            <select onChange={e=>selected = jurados.find(j=>j.name===e.target.value)} defaultValue=''>
              <option value='' disabled>Selecciona jurado</option>
              {jurados.map(j=>(<option key={j.name} value={j.name}>{j.name}</option>))}
            </select>
            <input ref={x=>pinRef=x} placeholder='PIN' inputMode='numeric' maxLength={4}/>
            <button onClick={()=>{
              if(!selected) return alert('Selecciona tu nombre');
              if(!pinRef?.value) return alert('Escribe tu PIN');
              if(pinRef.value===selected.pin){ setJuradoActivo(selected); }
              else alert('PIN incorrecto');
            }}>Entrar</button>
            <button className='secondary' onClick={()=>setView('home')}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  if(view==='jurado'){
    const datos=evaluaciones[juradoActivo.name]||{};
    return (
      <div className='wrap'>
        <TopBar eventName={evento} setView={setView} view={view}/>
        <div className='content'>
          <h2>{evento}</h2><h3>Evaluación de: {juradoActivo.name}</h3>
          {bloqueado && <p className='locked'>Evaluación bloqueada</p>}
          <div className='table-wrap'><table><thead><tr>
            <th>Agrupación</th>{CRITERIOS.map(c=>(<th key={c}>{c}</th>))}<th>Total</th>
          </tr></thead><tbody>
            {agrupaciones.map(ag=>{
              const fila=datos[ag]||{};
              const total=Object.values(fila).reduce((a,b)=>a+(Number(b)||0),0);
              return (<tr key={ag}>
                <td className='left'>{ag}</td>
                {CRITERIOS.map(c=>(<td key={c}><input type='number' min={0} max={5} disabled={bloqueado} value={(fila[c]??'')} onChange={e=>evaluar(ag,c,e.target.value)} /></td>))}
                <td><strong>{total}</strong></td>
              </tr>);
            })}
          </tbody></table></div>
          <button className='secondary' onClick={()=>setView('final')}>Ir a resultados finales</button>
        </div>
      </div>
    );
  }

  // ✅ Reemplaza TODO tu bloque de "final" por esto
if (view === 'final') {
  const orden = Array.isArray(tablaTotales) ? tablaTotales : [];
  const ganador = orden[0];          // [nombre, total] o undefined
  const top3 = orden.slice(0, 3);

  return (
    <div className="wrap final">
      <TopBar eventName={evento} setView={setView} view={view} />
      <div className="content podium">
        <h2>Resultados Finales</h2>

        {orden.length === 0 ? (
          <p>Sin datos aún. Agrega notas y vuelve aquí. 🎼</p>
        ) : (
          <>
            {/* Ganador destacado */}
            <div className="winner" style={{
              background:'#ffffff22',
              border:'1px solid #ffffff44',
              padding:'16px',
              borderRadius:'14px',
              margin:'12px 0'
            }}>
              <h3 style={{margin:'0 0 8px'}}>🏆 Ganador</h3>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <strong style={{fontSize:'1.2rem'}}>{ganador[0]}</strong>
                <span style={{fontWeight:800}}>{ganador[1]} pts</span>
              </div>
            </div>

            {/* Top 3 */}
            <ol>
              {top3.map(([ag, total], idx) => (
                <li key={ag} className={idx===0?'gold':idx===1?'silver':'bronze'}>
                  <span className="place">{idx + 1}º</span>
                  <span className="name">{ag}</span>
                  <span className="score">{total} pts</span>
                </li>
              ))}
            </ol>
          </>
        )}

        <button onClick={() => setView('home')}>Volver al inicio</button>
      </div>
    </div>
  );
}
  return null;
}
