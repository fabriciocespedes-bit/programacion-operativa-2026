/* Presentación de la programación operativa 2026 · DAS Pozo Almonte */
(function () {
"use strict";

const D = window.DATOS;
const N  = n => (n == null ? "—" : Number(n).toLocaleString("es-CL"));
const N1 = n => (n == null ? "—" : Number(n).toLocaleString("es-CL",
              {minimumFractionDigits:1, maximumFractionDigits:1}));
const N2 = n => (n == null ? "—" : Number(n).toLocaleString("es-CL",
              {minimumFractionDigits:2, maximumFractionDigits:2}));
const P0 = n => (n == null ? "—" : (n*100).toLocaleString("es-CL",
              {maximumFractionDigits:0}) + "%");
const P1 = n => (n == null ? "—" : (n*100).toLocaleString("es-CL",
              {minimumFractionDigits:1, maximumFractionDigits:1}) + "%");
const P2 = n => (n == null ? "—" : (n*100).toLocaleString("es-CL",
              {minimumFractionDigits:2, maximumFractionDigits:2}) + "%");

const C = {
  inst900:"#0f2454", inst800:"#16306e", inst700:"#1e3a8a", inst600:"#2a4ba0",
  inst500:"#3a63c4", inst400:"#5b82d6", inst300:"#93b4fd", inst200:"#bfd3fe",
  inst100:"#dbe6fe", inst50:"#eff4ff",
  oro:"#f4b400", naranja:"#ea580c",
  verde:"#15803d", amarillo:"#b45309", rojo:"#b91c1c",
  slate500:"#51648a", slate400:"#8698bd", slate300:"#bfd3fe",
  slate200:"#e7ecf7", surface:"#ffffff"
};

/* estado de desempeño: única justificación del semáforo */
function estado(rel){
  if (rel == null) return "slate";
  if (rel >= 0.90) return "verde";
  if (rel >= 0.75) return "amarillo";
  return "rojo";
}
const COLOR_ESTADO = {verde:C.verde, amarillo:C.amarillo, rojo:C.rojo,
                      slate:C.slate400};

/* ------------------------------------------------------------------ tooltip */
const tip = document.getElementById("tip");
function mostrarTip(ev, html){
  tip.innerHTML = html;
  tip.style.opacity = "1";
  const r = tip.getBoundingClientRect();
  let x = ev.clientX + 14, y = ev.clientY + 14;
  if (x + r.width  > innerWidth  - 8) x = ev.clientX - r.width  - 14;
  if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - 14;
  tip.style.left = x + "px";
  tip.style.top  = y + "px";
}
function ocultarTip(){ tip.style.opacity = "0"; }

function conTip(el, html){
  el.addEventListener("mousemove", e => mostrarTip(e, html));
  el.addEventListener("mouseleave", ocultarTip);
  el.setAttribute("tabindex","0");
  el.addEventListener("focus", e => {
    const b = el.getBoundingClientRect();
    mostrarTip({clientX:b.right, clientY:b.top}, html);
  });
  el.addEventListener("blur", ocultarTip);
}

/* paso de grilla legible: 1, 2, 2,5 o 5 por potencia de diez */
function pasoBonito(max, objetivo){
  const bruto = max / (objetivo || 4);
  const e = Math.pow(10, Math.floor(Math.log10(bruto)));
  const r = bruto / e;
  const mult = r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10;
  return mult * e;
}
function ejeBonito(max, objetivo){
  const paso = pasoBonito(max, objetivo);
  const tope = Math.ceil(max / paso) * paso;
  const t = [];
  for (let v = 0; v <= tope + paso/1000; v += paso) t.push(v);
  return {tope, ticks:t};
}

const SVGNS = "http://www.w3.org/2000/svg";
const el = (t, a) => { const e = document.createElementNS(SVGNS, t);
  for (const k in (a||{})) e.setAttribute(k, a[k]); return e; };

/* ------------------------------------------- barras horizontales (magnitud) */
/* cfg: {datos:[{et,val,color,tip,extra}], max, ref:{v,rot}, fmt, alto, etAncho,
         dir:'der'|'ambos'} */
function barrasH(cfg){
  const d = cfg.datos, n = d.length;
  const filaH = cfg.filaH || 26, gap = 6;
  const ml = cfg.etAncho || 168, mr = 58, mt = cfg.ref ? 20 : 6, mb = 26;
  const w = cfg.ancho || 760;
  const h = mt + n*filaH + mb;
  const aw = w - ml - mr;
  const svg = el("svg", {class:"chart", viewBox:`0 0 ${w} ${h}`,
                         role:"img", "aria-label":cfg.etiqueta||"gráfico"});

  const vals = d.map(x => x.val);
  const neg  = cfg.dir === "ambos";
  const crudo = cfg.max != null ? cfg.max
              : Math.max(...vals.map(Math.abs), 0.0001);
  const eje  = ejeBonito(crudo, neg ? 2 : 4);
  const maxV = eje.tope;
  const x0   = neg ? ml + aw/2 : ml;
  const esc  = v => (neg ? (v/maxV)*(aw/2) : (v/maxV)*aw);

  /* grilla + eje con pasos legibles */
  const ticks = neg
    ? eje.ticks.slice(1).map(v=>-v).reverse().concat(eje.ticks)
    : eje.ticks;
  ticks.forEach(t => {
    const x = x0 + esc(t);
    svg.appendChild(el("line", {x1:x, x2:x, y1:mt-4, y2:mt+n*filaH,
      class:"gl", "stroke-width":1}));
    const tx = el("text", {x, y:h-9, "text-anchor":"middle", class:"ax"});
    tx.setAttribute("style","font-variant-numeric:tabular-nums");
    tx.textContent = (cfg.fmtEje||cfg.fmt||N)(t);
    svg.appendChild(tx);
  });
  if (neg) svg.appendChild(el("line",{x1:x0,x2:x0,y1:mt-4,y2:mt+n*filaH,
    stroke:C.slate300,"stroke-width":1.5}));

  /* línea de referencia */
  if (cfg.ref){
    const x = x0 + esc(cfg.ref.v);
    svg.appendChild(el("line",{x1:x,x2:x,y1:mt-12,y2:mt+n*filaH,class:"ref"}));
    const t = el("text",{x, y:mt-16,"text-anchor":"middle",class:"ax",
      fill:C.inst700,"font-weight":"600"});
    t.textContent = cfg.ref.rot;
    svg.appendChild(t);
  }

  d.forEach((r,i) => {
    const y = mt + i*filaH;
    const bh = filaH - gap;
    const et = el("text",{x:ml-9, y:y+bh/2+4, "text-anchor":"end", class:"ax",
      fill:"#334155"});
    et.textContent = r.et;
    svg.appendChild(et);

    const L = Math.abs(esc(r.val));
    const bx = r.val < 0 ? x0 - L : x0;
    const g  = el("g", {class:"mark"});
    g.appendChild(el("rect",{x:bx, y, width:Math.max(L,2), height:bh, rx:4,
      fill:r.color || C.inst500}));
    /* separador de 2px sobre la superficie */
    g.appendChild(el("rect",{x:bx, y:y+bh, width:Math.max(L,2), height:2,
      fill:C.surface}));
    svg.appendChild(g);
    conTip(g, r.tip || `<b>${r.et}</b><br>${(cfg.fmt||N)(r.val)}`);

    const vx = r.val < 0 ? bx - 7 : bx + L + 7;
    const vt = el("text",{x:vx, y:y+bh/2+4,
      "text-anchor": r.val < 0 ? "end":"start", class:"ax",
      fill:"#334155","font-weight":"600"});
    vt.setAttribute("style","font-variant-numeric:tabular-nums");
    vt.textContent = (cfg.fmtVal||cfg.fmt||N)(r.val);
    svg.appendChild(vt);
  });
  return svg;
}

/* ------------------------------------------------ línea temporal (1 serie) */
function lineaT(cfg){
  const d = cfg.datos;
  const w = cfg.ancho||760, h = cfg.alto||220;
  const ml=46, mr=16, mt=14, mb=30;
  const aw=w-ml-mr, ah=h-mt-mb;
  const svg = el("svg",{class:"chart", viewBox:`0 0 ${w} ${h}`, role:"img",
                        "aria-label":cfg.etiqueta||"serie mensual"});
  const vals = d.map(p=>p.v);
  const bruto = cfg.max != null ? cfg.max
              : Math.max(...vals, cfg.ref||0) * 1.08;
  const max = ejeBonito(bruto, 4).tope;
  const min = 0;
  const X = i => ml + (d.length===1?aw/2:(i/(d.length-1))*aw);
  const Y = v => mt + ah - ((v-min)/(max-min))*ah;

  for (let k=0;k<=4;k++){
    const v=min+(max-min)*k/4, y=Y(v);
    svg.appendChild(el("line",{x1:ml,x2:ml+aw,y1:y,y2:y,class:"gl","stroke-width":1}));
    const t=el("text",{x:ml-8,y:y+4,"text-anchor":"end",class:"ax"});
    t.setAttribute("style","font-variant-numeric:tabular-nums");
    t.textContent=(cfg.fmtEje||cfg.fmt||N)(Math.round(v)); svg.appendChild(t);
  }
  if (cfg.ref != null){
    const y=Y(cfg.ref);
    svg.appendChild(el("line",{x1:ml,x2:ml+aw,y1:y,y2:y,class:"ref"}));
    const t=el("text",{x:ml+aw,y:y-6,"text-anchor":"end",class:"ax",
      fill:C.inst700,"font-weight":"600"});
    t.textContent=cfg.refRot||""; svg.appendChild(t);
  }
  const pts = d.map((p,i)=>`${X(i)},${Y(p.v)}`).join(" ");
  svg.appendChild(el("polyline",{points:pts, fill:"none", stroke:C.inst500,
    "stroke-width":2.5, "stroke-linejoin":"round","stroke-linecap":"round"}));
  d.forEach((p,i)=>{
    const g=el("g",{class:"mark"});
    g.appendChild(el("circle",{cx:X(i),cy:Y(p.v),r:5.5,fill:C.surface,
      stroke:C.inst500,"stroke-width":2}));
    svg.appendChild(g);
    conTip(g, `<span class="l">${p.et}</span><br><b>${(cfg.fmt||N)(p.v)}</b>`);
    const t=el("text",{x:X(i),y:h-9,"text-anchor":"middle",class:"ax"});
    t.textContent=p.et; svg.appendChild(t);
  });
  return svg;
}

/* --------------------------------------------------------------- utilidades */
function nodo(html){ const t=document.createElement("template");
  t.innerHTML = html.trim(); return t.content.firstElementChild; }
function card(titulo, sub, cuerpoNode){
  const c = nodo(`<div class="card print-break">
    ${titulo?`<div class="card-h"><h3>${titulo}</h3>${sub?`<p>${sub}</p>`:""}</div>`:""}
    <div class="card-b"></div></div>`);
  c.querySelector(".card-b").appendChild(cuerpoNode);
  return c;
}
function tabla(cols, filas, opts){
  const o = opts||{};
  const w = nodo(`<div class="scroll-x"><table><thead><tr>${
    cols.map(c=>`<th class="${c.num?"num":""}">${c.t}</th>`).join("")
  }</tr></thead><tbody></tbody></table></div>`);
  const tb = w.querySelector("tbody");
  filas.forEach(f=>{
    const tr = document.createElement("tr");
    if (f.__tot) tr.className = "tot";
    cols.forEach(c=>{
      const td = document.createElement("td");
      if (c.num) td.className = "num";
      const v = f[c.k];
      if (v instanceof Node) td.appendChild(v); else td.innerHTML = v ?? "";
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
  if (o.nota) w.appendChild(nodo(`<p class="nota">${o.nota}</p>`));
  return w;
}
const kpi = (lab,val,hint,tono) => nodo(
  `<div class="kpi ${tono||""}"><div class="lab">${lab}</div>
   <div class="val">${val}</div>${hint?`<div class="hint">${hint}</div>`:""}</div>`);
const badgeEstado = rel => {
  const e = estado(rel);
  const txt = {verde:"Cumple", amarillo:"En riesgo", rojo:"No cumple",
               slate:"Sin dato"}[e];
  return `<span class="badge b-${e}"><i class="pt"></i>${txt}</span>`;
};

/* =================================================================== SLIDES */
const SLIDES = [];
const S = (nom, titulo, fn) => SLIDES.push({nom, titulo, fn});

/* 1 ------------------------------------------------------------- portada */
S("Portada", "Programación Operativa 2026", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="portada">
    <div class="cuerpo">
      <img class="sol" src="sol-das.png" alt="">
      <div class="rotulo">Control de gestión sanitaria</div>
      <h2>Programación Operativa <em>2026</em></h2>
      <p class="bajada">Diagnóstico de ejecución, cumplimiento de metas
         sanitarias y antecedentes para la propuesta de dotación 2027.
         Departamento de Salud Municipal de Pozo Almonte ·
         Servicio de Salud Tarapacá.</p>
      <div class="marcas">
        <img src="logo-municipalidad.png" alt="Ilustre Municipalidad de Pozo Almonte">
        <img src="logo-das.png" alt="Departamento de Salud Municipal" class="das">
      </div>
    </div>
    <div class="fuentes">
      Fuentes: programación operativa 2026 (${N(D.kpi.lineas)} líneas) ·
      REM series A, BM y D de enero a agosto de 2026 ·
      REM serie P, corte de junio de 2026, que es semestral ·
      META 2026 (5).xlsx, instrumento de cálculo del Departamento ·
      Resolución Exenta 04.481 que fija las metas sanitarias ·
      Resolución Exenta 5505 que aprueba la dotación 2026.
    </div></div>`));

  const g = nodo(`<div class="grid g4"></div>`);
  g.appendChild(kpi("Población inscrita", N(D.meta.poblacion),
    "Validada FONASA · 4 establecimientos", "inst"));
  g.appendChild(kpi("Actividades programadas", N(D.kpi.actividades),
    `${N(D.kpi.horas_directas)} horas de atención directa`));
  g.appendChild(kpi("Déficit clínico", N2(D.kpi.deficit_clinico) + " JCE",
    "Estamentos clínicos bajo la demanda", "rojo"));
  g.appendChild(kpi("Componente variable", P2(D.kpi.cumplimiento),
    "Tramo 3: hoy no se pagaría", "rojo"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-danger">
    <strong>Lo más urgente.</strong> Con el avance a agosto el cumplimiento de
    las metas Ley 19.813 es de ${P2(D.kpi.cumplimiento)}. Bajo 75% no se paga el
    componente variable a nadie. Faltan
    ${N2((D.kpi.umbral_bajo - D.kpi.cumplimiento)*100)} puntos para cruzar ese
    umbral, y hay una forma corta de conseguirlos.</div>`));
  return f;
});

/* 2 ------------------------------------------------------------ el tramo */
S("El tramo", "Hoy el componente variable no se pagaría", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Hoy el componente variable no se
    pagaría</h2><p>La Ley 19.813 paga el 100% si el cumplimiento global supera
    el 90%, el 50% entre 75% y 89,99%, y nada bajo 75%. Con el avance a agosto
    la comuna está en ${P2(D.kpi.cumplimiento)}.</p></div>`));

  const g = nodo(`<div class="grid g3"></div>`);
  g.appendChild(kpi("Cumplimiento a agosto", P2(D.kpi.cumplimiento),
    `Nueve metas evaluables. Con la meta 8 cerrada llega a ${P2(D.metas_total_con8)}`,
    "rojo"));
  g.appendChild(kpi("Faltan para el tramo 2",
    N2((D.kpi.umbral_bajo - D.kpi.cumplimiento)*100) + " puntos",
    "Para cobrar el 50% del componente", "amarillo"));
  g.appendChild(kpi("Faltan para el tramo 1",
    N2((D.kpi.umbral - D.kpi.cumplimiento)*100) + " puntos",
    "Para cobrar el 100%", "inst"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const datos = [
    {et:"Cumplimiento a agosto 2026", val:D.kpi.cumplimiento, color:C.rojo,
     tip:`<b>Cumplimiento a agosto</b><br>${P2(D.kpi.cumplimiento)}<br>
          <span class="l">${D.kpi.tramo}</span><br>
          <span class="l">Metas del REM A a agosto · metas del REM P a junio</span>`},
    {et:"Umbral del tramo 2 · se paga el 50%", val:D.kpi.umbral_bajo,
     color:C.inst300, tip:`<b>Tramo 2</b><br>Desde ${P0(D.kpi.umbral_bajo)}`},
    {et:"Umbral del tramo 1 · se paga el 100%", val:D.kpi.umbral,
     color:C.inst200, tip:`<b>Tramo 1</b><br>Desde ${P0(D.kpi.umbral)}`},
  ];
  f.appendChild(card("Dónde está la comuna hoy",
    "Los dos umbrales que definen cuánto se paga.",
    barrasH({datos, max:1, fmt:P1, fmtEje:P0, etAncho:250, filaH:36,
      ancho:820, etiqueta:"Cumplimiento frente a los umbrales"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-info">
    <strong>El dato no está en discusión.</strong> Los cuatro numeradores del
    REM serie P del instrumento coinciden exactamente con la extracción que
    hice por separado desde los archivos originales, y la serie mensual de
    lactancia materna se reproduce desde el REM A03. El problema no es de
    medición sino de resultado.</div>`));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-warn">
    <strong>Un punto que conviene aclarar con la referencia técnica.</strong>
    El instrumento no limita el aporte de cada meta al 100% de su ponderación:
    la meta 6 aporta 0,1350 sobre una ponderación de 12,5%. Si el Servicio
    aplicara ese tope, el resultado sería
    ${P2(D.kpi.cumplimiento_topado)}, que sigue en el tramo 3.</div>`));
  return f;
});

/* 3 -------------------------------------------------------------- metas */
S("Metas Ley 19.813", "Metas sanitarias, una por una", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Metas sanitarias, una por una</h2>
    <p>${D.fuente_metas}.</p></div>`));

  const conDato = D.metas.filter(m => m.rel != null);
  const datos = conDato.map(m => ({
    et:`Meta ${m.id}`, val:m.rel,
    color:COLOR_ESTADO[estado(m.rel)],
    tip:`<b>Meta ${m.id}</b><br>${m.nombre}<br>
         <span class="l">${N(m.num)} de ${N(m.den)}</span><br>
         Avance ${P1(m.avance)} · meta comunal ${P0(m.metacom)}<br>
         Alcanza el <b>${P1(m.rel)}</b> de la meta`
  }));
  f.appendChild(card("Porcentaje de la meta alcanzado",
    "Verde: cumple. Ámbar: entre 75% y 90%. Rojo: bajo 75%.",
    barrasH({datos, max:1.1, ref:{v:1, rot:"Meta cumplida"}, fmt:P0,
      etAncho:80, filaH:28, ancho:800,
      etiqueta:"Porcentaje de la meta alcanzado por indicador"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const sumaPond = D.metas.reduce((a,m)=>a+m.pond, 0);
  const filas = D.metas.map(m => ({
    id:`<b>Meta ${m.id}</b>`, nombre:m.nombre,
    meta: P0(m.metacom), av: P1(m.avance),
    num: N(m.num), den: N(m.den),
    rel: m.rel != null ? P1(m.rel) : "—",
    est: m.binaria ? `<span class="badge b-slate">Todo o nada</span>`
                   : badgeEstado(m.rel),
    corte: m.serie === "A" ? `<span class="badge b-inst">agosto</span>`
         : m.serie === "P" ? `<span class="badge b-slate">junio</span>`
         : `<span class="badge b-slate">fin de año</span>`,
    ap: `<b>${N2(m.aporte*100)}</b>`,
    pond: N2(m.pond*100),
    falta: m.binaria ? "todo o nada" : (m.falta ? N(m.falta) : "—"),
    mes: m.binaria ? "—" : (m.por_mes ? `<b>${N(m.por_mes)}</b>` : "—")
  }));
  filas.push({__tot:true, id:"", nombre:"Cumplimiento del componente variable",
    meta:"", av:"", num:"", den:"", rel:"", est:"", corte:"",
    ap:`<b>${N2(D.kpi.cumplimiento*100)}</b>`,
    pond:`<b>${N2(sumaPond*100)}</b>`,
    falta:`<b>${N(D.metas.reduce((a,m)=>a+(m.falta||0),0))}</b>`,
    mes:`<b>${N(D.metas.reduce((a,m)=>a+(m.por_mes||0),0))}</b>`});
  f.appendChild(card("Detalle por meta",
    "El aporte es lo que la meta suma hoy; la ponderación es lo máximo que puede sumar.",
    tabla([
    {t:"", k:"id"}, {t:"Componente", k:"nombre"},
    {t:"Meta", k:"meta", num:true}, {t:"Avance", k:"av", num:true},
    {t:"Numerador", k:"num", num:true}, {t:"Denominador", k:"den", num:true},
    {t:"% de la meta", k:"rel", num:true}, {t:"Estado", k:"est"},
    {t:"Corte", k:"corte"},
    {t:"Aporte actual", k:"ap", num:true},
    {t:"Ponderación máxima", k:"pond", num:true},
    {t:"Faltan para la meta", k:"falta", num:true},
    {t:`KPI mensual (quedan ${D.meses_restantes})`, k:"mes", num:true},
  ], filas, {nota:`Las metas 1, 2, 4, 4.1, 5 y 6 ponderan 12,5% cada una; las metas 3.1, 3.2, 7 y 8 ponderan 6,25%. Las metas 1, 3.1, 3.2 y 6 se nutren del REM serie A y están acumuladas hasta agosto; las metas 2, 4, 4.1, 5 y 7 vienen del REM serie P, que es semestral y no vuelve a cortar hasta diciembre. Las metas 4.1 y 6 superan su meta comunal y quedan topadas en el 100% de su ponderación: el exceso no compensa a las demás. La meta 8 va en cero porque es todo o nada y se define a fin de año. El KPI mensual reparte lo que falta en los ${D.meses_restantes} meses que quedan, de septiembre a diciembre.`})));
  return f;
});

/* 4 ------------------------------------------------------------- palanca */
S("Cómo cruzar el 75%", "La forma más corta de cruzar el umbral", () => {
  const f = document.createDocumentFragment();
  const brecha = D.kpi.umbral_bajo - D.kpi.cumplimiento;
  f.appendChild(nodo(`<div class="enc"><h2>La forma más corta de cruzar el
    umbral</h2><p>Faltan ${N2(brecha*100)} puntos. No todas las metas cuestan
    lo mismo: las de denominador pequeño rinden mucho más por cada caso que se
    recupera.</p></div>`));

  const conPor = D.metas.filter(m => m.por_caso != null)
                        .sort((a,b) => b.por_caso - a.por_caso);
  f.appendChild(card("Cuánto sube el cumplimiento por cada caso adicional",
    "Puntos porcentuales que aporta una persona más que alcanza el indicador.",
    barrasH({datos: conPor.map(m => ({
      et:`Meta ${m.id}`, val:m.por_caso*100,
      color: m.por_caso > 0.001 ? C.inst600 : C.inst200,
      tip:`<b>Meta ${m.id}</b><br>${m.nombre}<br>
           Cada caso aporta <b>${N2(m.por_caso*100)}</b> puntos<br>
           <span class="l">Denominador ${N(m.den)} · faltan ${N(m.falta)} para la meta</span>`
    })), fmt:v=>N2(v)+" pts", etAncho:80, filaH:26, ancho:760,
       etiqueta:"Aporte marginal por caso"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const g = nodo(`<div class="grid g2"></div>`);
  g.appendChild(kpi("Meta 8 · Plan de Salud Comunitaria",
    `+${N2(D.metas_pond8*100)} pts`,
    "Todo o nada. Ejecutado y evaluado participativamente antes de diciembre",
    "inst"));
  g.appendChild(kpi("Metas 3.1 y 3.2 · Odontológicas", "+3,23 pts",
    "247 ingresos a control CERO y 19 niños de 6 años sin caries", "inst"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-info">
    <strong>Tres acciones cruzan el umbral, y ninguna exige producción nueva
    fuera de ritmo.</strong> Cerrar la meta 8 aporta
    ${N2(D.metas_pond8*100)} puntos y lleva el avance a
    ${P2(D.metas_total_con8)}. Completar la meta 3.1, que necesita 247 ingresos
    más a control con enfoque de riesgo y viene produciendo 118 al mes, aporta
    1,29. Completar la meta 3.2, que necesita 19 niños más y viene produciendo
    cinco al mes, aporta 1,94. Con las tres el avance pasa de
    ${P2(D.kpi.cumplimiento)} a 77,70% y entra al tramo 2.</div>`));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-warn">
    <strong>Lo que no alcanza a moverse en cuatro meses.</strong> La meta 5
    necesita ${N(D.metas.find(m=>m.id==="5").falta)} personas más con
    hipertensión compensada y la meta 2 necesita
    ${N(D.metas.find(m=>m.id==="2").falta)} mujeres más con PAP vigente. Son
    metas de denominador grande: aunque son las que más pesan en el diagnóstico
    sanitario, no son la palanca para el cierre de este año.</div>`));
  return f;
});

/* 5 ---------------------------------------------------- pesquisa vs control */
S("Pesquisa", "Por qué fallan las metas 4 y 5", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Por qué fallan las metas 4 y 5</h2>
    <p>De quienes están bajo control, una proporción razonable está compensada.
    Pero estas metas se miden sobre la población estimada de la comuna, no
    sobre la que está en el programa: lo que falla es la pesquisa.</p></div>`));

  const c = D.pscv.comuna;
  const m4 = D.metas.find(m=>m.id==="4"), m5 = D.metas.find(m=>m.id==="5");
  const g = nodo(`<div class="grid g4"></div>`);
  g.appendChild(kpi("Hipertensión compensada", P1(c.hta_comp/c.hta_bc),
    `${N(c.hta_comp)} de ${N(c.hta_bc)} bajo control`, "verde"));
  g.appendChild(kpi("Diabetes compensada", P1(c.dm2_comp/c.dm2_bc),
    `${N(c.dm2_comp)} de ${N(c.dm2_bc)} bajo control`, "amarillo"));
  g.appendChild(kpi("HTA bajo control", P1(c.hta_bc/m5.den),
    `de las ${N(m5.den)} personas estimadas`, "rojo"));
  g.appendChild(kpi("DM2 bajo control", P1(c.dm2_bc/m4.den),
    `de las ${N(m4.den)} personas estimadas`, "rojo"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(card("Del universo estimado a la persona compensada",
    "Cada barra es la proporción que sobrevive de la población estimada.",
    barrasH({datos:[
      {et:"HTA · bajo control", val:c.hta_bc/m5.den, color:C.inst300,
       tip:`<b>Hipertensión bajo control</b><br>${N(c.hta_bc)} de ${N(m5.den)}`},
      {et:"HTA · compensada", val:c.hta_comp/m5.den, color:C.inst600,
       tip:`<b>Hipertensión compensada</b><br>${N(c.hta_comp)} de ${N(m5.den)}<br>
            <span class="l">Meta: ${P0(m5.metacom)}</span>`},
      {et:"DM2 · bajo control", val:c.dm2_bc/m4.den, color:C.inst300,
       tip:`<b>Diabetes bajo control</b><br>${N(c.dm2_bc)} de ${N(m4.den)}`},
      {et:"DM2 · compensada", val:c.dm2_comp/m4.den, color:C.inst600,
       tip:`<b>Diabetes compensada</b><br>${N(c.dm2_comp)} de ${N(m4.den)}<br>
            <span class="l">Meta: ${P0(m4.metacom)}</span>`},
    ], max:0.5, fmt:P1, fmtEje:P0, etAncho:150, filaH:30, ancho:760,
       etiqueta:"Cobertura y compensación sobre población estimada"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-danger">
    <strong>Alertas clínicas del corte de junio.</strong>
    ${N(c.hba1c_9)} personas con diabetes tienen hemoglobina glicosilada igual o
    superior a 9%, es decir ${P1(c.hba1c_9/c.dm2_bc)} de las que están bajo
    control. Sólo ${P1(c.podologia/c.dm2_bc)} tiene atención podológica vigente,
    pese a que ${P1(c.pie_total/c.dm2_bc)} tiene la evaluación del pie al día. Hay
    ${N(c.amputacion)} amputaciones por pie diabético.</div>`));
  return f;
});

/* 5b ---------------------------------------------------------------- iaaps */
S("IAAPS", "Índice de Actividad de la Atención Primaria", () => {
  const f = document.createDocumentFragment();
  const I = D.iaaps;
  f.appendChild(nodo(`<div class="enc"><h2>Índice de Actividad de la Atención
    Primaria</h2><p>El IAAPS se evalúa indicador por indicador y su resultado
    afecta la transferencia per cápita, a diferencia de las metas de la Ley
    19.813, que determinan el componente variable del desempeño colectivo.
    Corte de agosto. Fuente: ${I.fuente}.</p></div>`));

  const g = nodo(`<div class="grid g4"></div>`);
  g.appendChild(kpi("No alcanzaron el corte de julio",
    `${I.en_riesgo_corte}`,
    `De ${I.filas.filter(d=>d.acumula).length} que acumulan contra corte`,
    I.en_riesgo_corte === 0 ? "verde" : "rojo"));
  g.appendChild(kpi("Indicadores que cumplen la meta anual",
    `${I.cumplen} de ${I.total}`,
    "Medidos contra la meta de cierre",
    I.cumplen/I.total >= 0.9 ? "verde" : "amarillo"));
  g.appendChild(kpi("Cumplimiento promedio", P1(I.promedio),
    "Topando cada indicador en 100%",
    I.promedio >= 0.9 ? "verde" : I.promedio >= 0.75 ? "amarillo" : "rojo"));
  g.appendChild(kpi("Próximo corte", `${P0(I.prox_fraccion)}`,
    `Septiembre. Los cortes son 30%, 50%, 70% y 100%`, "inst"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-warn">
    <strong>El instrumento no evalúa solo al cierre: evalúa cuatro veces.</strong>
    Los cortes oficiales son mayo 30%, julio 50%, septiembre 70% y diciembre
    100% de la meta anual, y están declarados en la propia planilla. El ritmo
    esperado se acelera, de modo que repartir en partes iguales lo que falta
    subestima la exigencia del corte más cercano.</div>`));

  f.appendChild(nodo(`<div style="height:14px"></div>`));

  const acum = I.filas.filter(d => d.acumula);
  const filasCorte = acum.map(d => {
    const c7 = d.cortes.find(c => c.corte === "julio");
    const c9 = d.cortes.find(c => c.corte === "septiembre");
    return {
      id:`<b>IAAPS ${d.id}</b>`, nombre:d.nombre,
      acum:N(d.num), jul:N(Math.round(c7.esperado)),
      paso: c7.cumplido
        ? `<span class="badge b-verde"><i class="pt"></i>Sí</span>`
        : `<span class="badge b-rojo"><i class="pt"></i>No</span>`,
      sep:N(Math.round(c9.esperado)),
      falta: c9.brecha > 0 ? `<b>${N(Math.round(c9.brecha))}</b>` : "—",
      origen: d.cortes_declarados
        ? `<span class="badge b-slate">planilla</span>`
        : `<span class="badge b-slate">derivado</span>`
    };
  });
  f.appendChild(card("Ritmo contra los cortes oficiales",
    "El corte de septiembre exige el 70% de la meta anual.",
    tabla([
      {t:"", k:"id"}, {t:"Indicador", k:"nombre"},
      {t:"Acumulado a agosto", k:"acum", num:true},
      {t:"Corte julio · 50%", k:"jul", num:true},
      {t:"¿Lo alcanzó?", k:"paso"},
      {t:"Corte septiembre · 70%", k:"sep", num:true},
      {t:"Falta para septiembre", k:"falta", num:true},
      {t:"Origen del corte", k:"origen"},
    ], filasCorte, {nota:"«Planilla» significa que el valor esperado del corte viene declarado en META 2026; «derivado» que lo calculé aplicando el porcentaje del corte al objetivo anual, porque la planilla no lo trae. Los indicadores que no acumulan producción, como el porcentaje de derivación, no aparecen aquí porque un corte de avance no les aplica."})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));

  const conRel = I.filas.filter(d => d.rel != null)
                        .slice().sort((a,b) => a.rel - b.rel);
  f.appendChild(card("Porcentaje de la meta alcanzado",
    "Ordenado de peor a mejor. Verde: cumple. Rojo: bajo 75% de su meta.",
    barrasH({datos: conRel.map(d => ({
      et:`IAAPS ${d.id}`, val:d.rel, color:COLOR_ESTADO[estado(d.rel)],
      tip:`<b>IAAPS ${d.id}</b><br>${d.nombre}<br>
           <span class="l">${d.tipo === "tasa"
             ? `Meta ${N2(d.meta)} · avance ${N2(d.avance)}`
             : `Meta ${P1(d.meta)} · avance ${P1(d.avance)}`}</span><br>
           ${N(d.num)} de ${N(d.den)}<br>
           ${d.falta ? `Faltan <b>${N(Math.round(d.falta))}</b> · ${N(Math.round(d.por_mes))} por mes` : "<b>Cumple</b>"}`
    })), max:1.1, ref:{v:1, rot:"Meta cumplida"}, fmt:P0, etAncho:95,
       filaH:25, ancho:820, etiqueta:"Porcentaje de la meta IAAPS alcanzado"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));

  const filas = I.filas.map(d => ({
    id:`<b>IAAPS ${d.id}</b>`, nombre:d.nombre,
    meta: d.tipo === "tasa" ? N2(d.meta) : P1(d.meta),
    av: d.tipo === "tasa" ? N2(d.avance) : P1(d.avance),
    num: N(d.num), den: d.den ? N(d.den) : "—",
    rel: P1(d.rel),
    est: d.cumple ? `<span class="badge b-verde"><i class="pt"></i>Cumple</span>`
       : `<span class="badge b-rojo"><i class="pt"></i>No cumple</span>`,
    falta: d.falta ? N(Math.round(d.falta)) : "—",
    mes: d.por_mes ? `<b>${N(Math.round(d.por_mes))}</b>` : "—"
  }));
  f.appendChild(card("Detalle por indicador",
    "El KPI mensual es lo que hay que producir cada mes para llegar a la meta.",
    tabla([
      {t:"", k:"id"}, {t:"Indicador", k:"nombre"},
      {t:"Meta", k:"meta", num:true}, {t:"Avance", k:"av", num:true},
      {t:"Numerador", k:"num", num:true}, {t:"Denominador", k:"den", num:true},
      {t:"% de la meta", k:"rel", num:true}, {t:"Estado", k:"est"},
      {t:"Faltan", k:"falta", num:true},
      {t:`Por mes (quedan ${I.meses_restantes})`, k:"mes", num:true},
    ], filas, {nota:"El indicador 4, porcentaje de derivación al nivel secundario, cumple al estar bajo la meta y no sobre ella."})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-info">
    <strong>Los dos instrumentos comparten registros.</strong> El mismo
    esfuerzo en pesquisa cardiovascular mueve al mismo tiempo el IAAPS 14 y 15
    y las metas 4 y 5 de la Ley 19.813. Lo mismo ocurre entre el IAAPS 7 y la
    meta 1 de desarrollo psicomotor, y entre el IAAPS 17 y las metas
    odontológicas.</div>`));
  return f;
});

/* 5c -------------------------------------------------------------- agenda */
S("Agenda y NSP", "Inasistencia y uso de la agenda", () => {
  const f = document.createDocumentFragment();
  const A = D.agenda, PU = D.puente;
  const comp = A.por_mes.filter(m => !m.parcial);
  const tc = comp.reduce((a,m)=>a+m.citas,0);
  const ti = comp.reduce((a,m)=>a+m.inasistencias,0);
  const tcu = comp.reduce((a,m)=>a+m.cupos,0);
  const tbl = comp.reduce((a,m)=>a+m.bloqueados,0);

  f.appendChild(nodo(`<div class="enc"><h2>Inasistencia y uso de la
    agenda</h2><p>Reporte de productividad por profesional, enero a agosto de
    2026, en los cuatro establecimientos con población inscrita. Los datos de
    origen traen identificación del funcionario; acá están agregados por
    estamento y establecimiento, sin nombres ni RUN.</p></div>`));

  const g = nodo(`<div class="grid g4"></div>`);
  g.appendChild(kpi("NSP observado", P1(ti/tc),
    `${N(ti)} inasistencias sobre ${N(tc)} citas`, "inst"));
  g.appendChild(kpi("NSP supuesto en la programación", P0(PU.nsp_supuesto),
    "Uniforme para todos los estamentos", "rojo"));
  g.appendChild(kpi("Ocupación de la agenda", P1(tc/tcu),
    "Citas sobre cupos programados", "verde"));
  g.appendChild(kpi("Cupos bloqueados", N(tbl),
    `${P1(tbl/(tcu+tbl))} del total de cupos`, "amarillo"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-danger">
    <strong>El supuesto de inasistencia está al doble del observado.</strong>
    La programación asume ${P0(PU.nsp_supuesto)} uniforme y el registro muestra
    ${P1(PU.nsp_citas)} ponderado por citas. Ese supuesto se usa en la
    proyección de dotación 2027, de modo que la infla. Pero la corrección no es
    pareja: ponderado por horas el NSP baja a ${P1(PU.nsp_horas)}, porque TENS
    concentra un cuarto de las horas con una inasistencia de apenas
    ${P1(D.agenda.por_estamento.find(e=>e.estamento==="TENS").inasistencias/
        D.agenda.por_estamento.find(e=>e.estamento==="TENS").citas)}.</div>`));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(card("NSP mensual",
    "La línea marca el supuesto de la programación.",
    lineaT({
      datos: A.por_mes.filter(m=>!m.parcial).map(m=>({
        et: ["","ene","feb","mar","abr","may","jun","jul","ago"][m.mes],
        v: +(m.inasistencias/m.citas*100).toFixed(1)})),
      ref: PU.nsp_supuesto*100, refRot: "supuesto de la programación · 20%",
      max: 24, ancho: 820, alto: 230,
      fmt: v => N1(v)+"%", fmtEje: v => v+"%",
      etiqueta: "Inasistencia mensual observada"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const est = A.por_estamento.filter(e => e.citas >= 200)
                .slice().sort((a,b)=> (b.inasistencias/b.citas)-(a.inasistencias/a.citas));
  f.appendChild(card("NSP por estamento",
    "Ordenado de mayor a menor inasistencia. La línea marca el supuesto de 20%.",
    barrasH({datos: est.map(e => ({
      et:e.estamento, val:e.inasistencias/e.citas,
      color: e.inasistencias/e.citas >= PU.nsp_supuesto ? C.rojo : C.inst,
      tip:`<b>${e.estamento}</b><br>${N(e.inasistencias)} de ${N(e.citas)} citas<br>
           <span class="l">Cupos ${N(e.cupos)} · bloqueados ${N(e.bloqueados)}</span>`
    })), max:0.25, ref:{v:PU.nsp_supuesto, rot:"supuesto"}, fmt:P0,
       etAncho:62, filaH:24, ancho:760, etiqueta:"Inasistencia por estamento"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(card("Detalle por establecimiento", "",
    tabla([
      {t:"Establecimiento", k:"e"}, {t:"Citas", k:"c", num:true},
      {t:"Inasistencias", k:"i", num:true}, {t:"NSP", k:"n", num:true},
      {t:"Cupos programados", k:"cu", num:true},
      {t:"Ocupación", k:"o", num:true},
      {t:"Cupos bloqueados", k:"b", num:true},
    ], A.por_establecimiento.map(x => ({
      e:x.establecimiento, c:N(x.citas), i:N(x.inasistencias),
      n:P1(x.inasistencias/x.citas), cu:N(x.cupos),
      o:P1(x.citas/x.cupos), b:N(x.bloqueados)
    })), {nota:"La ocupación supera el 100% donde se cita por sobre los cupos programados, mediante sobrecupo y atención espontánea. No hay información sobre qué cuenta el sistema como cupo bloqueado: puede incluir feriados, capacitación y licencias, que son legítimos. Conviene aclararlo antes de leerlo como capacidad desaprovechada."})));
  return f;
});

/* 6 ------------------------------------------------------------ ejecución */
S("Ejecución REM", "Lo programado contra lo efectivamente realizado", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Lo programado contra lo
    efectivamente realizado</h2><p>Enero a agosto según el REM de los cinco
    establecimientos. El ${P1(D.meta.meses_rem/12)} es una referencia
    proporcional del año transcurrido, no una exigencia de calendario: no existe
    un cronograma mensual aprobado contra el cual medir.</p></div>`));

  const conPct = D.ejecucion.filter(e => e.pct != null);
  f.appendChild(card("Avance sobre la referencia proporcional",
    "Sólo los indicadores en que el alcance del REM y el de la programación son comparables.",
    barrasH({datos: conPct.map(e => ({
      et:e.ind.length>40 ? e.ind.slice(0,38)+"…" : e.ind,
      val:e.pct, color:COLOR_ESTADO[estado(e.pct)],
      tip:`<b>${e.ind}</b><br><span class="l">${e.fuente} · nivel ${e.nivel}</span><br>
           Ejecutado ${N(Math.round(e.ejec))} de ${N(Math.round(e.esp))} esperados<br>
           Proyección a diciembre: ${N(Math.round(e.proy))}`
    })), max:1.1, ref:{v:1, rot:"Al día"}, fmt:P0, etAncho:250, filaH:28,
       ancho:840, etiqueta:"Avance de la ejecución por indicador"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));

  /* selector de serie mensual */
  const cont = nodo(`<div></div>`);
  const chips = nodo(`<div class="chips" style="margin-bottom:12px"></div>`);
  const graf = nodo(`<div></div>`);
  const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago"];
  let sel = 0;
  function pintar(){
    graf.innerHTML = "";
    const e = D.ejecucion[sel];
    graf.appendChild(lineaT({
      datos: e.mensual.map((v,i)=>({et:MESES[i], v:Math.round(v)})),
      ancho:820, alto:230, fmt:N,
      etiqueta:`Serie mensual de ${e.ind}`}));
    graf.appendChild(nodo(`<p class="nota">${e.fuente}. ${e.adv||""}</p>`));
  }
  D.ejecucion.forEach((e,i)=>{
    const b = nodo(`<button class="chip" type="button" aria-pressed="${i===0}">${
      e.ind.length>34 ? e.ind.slice(0,32)+"…" : e.ind}</button>`);
    b.addEventListener("click", ()=>{
      sel = i;
      chips.querySelectorAll(".chip").forEach((c,k)=>
        c.setAttribute("aria-pressed", String(k===i)));
      pintar();
    });
    chips.appendChild(b);
  });
  cont.appendChild(chips); cont.appendChild(graf);
  pintar();
  f.appendChild(card("Evolución mensual",
    "Elige un indicador para ver cómo se comportó mes a mes.", cont));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const nc = nodo(`<ul class="lista"></ul>`);
  D.no_comparable.forEach(x => nc.appendChild(
    nodo(`<li><b>${x[0]}</b> — ${x[2]}</li>`)));
  f.appendChild(card("Lo que no se puede medir con estos archivos",
    "Se declara en vez de calcular un porcentaje que no resistiría revisión.", nc));
  return f;
});

/* 7 ------------------------------------------------------------- brechas */
S("Brechas de dotación", "Cuántas jornadas faltan, por estamento", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Cuántas jornadas faltan, por
    estamento</h2><p>Comparación entre las horas que exige la programación
    —atención directa más actividades indirectas— y la capacidad de la dotación
    aprobada por la Resolución Exenta 5505. Una jornada completa equivalente son
    ${N1(D.meta.jce_horas)} horas al año.</p></div>`));

  const b = D.brechas.slice().sort((x,y)=>x.jce-y.jce);
  f.appendChild(card("Brecha en jornadas completas equivalentes",
    "Rojo: la dotación no alcanza a cubrir lo programado. Azul: hay holgura.",
    barrasH({datos:b.map(r=>({
      et:r.e, val:r.jce, color: r.jce<0 ? C.rojo : C.inst400,
      tip:`<b>${r.e}</b><br>Requiere ${N(r.req)} h · dispone ${N(r.cap)} h<br>
           Brecha: <b>${N2(r.jce)} JCE</b><br>
           <span class="l">${N(r.dir)} h directas + ${N(r.ind)} h indirectas</span>`
    })), dir:"ambos", fmt:N2, etAncho:168, filaH:26, ancho:800,
       etiqueta:"Brecha de jornadas por estamento clínico"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const g = nodo(`<div class="grid g3"></div>`);
  g.appendChild(kpi("Déficit clínico total", N2(D.kpi.deficit_clinico)+" JCE",
    "Sumando sólo los estamentos en déficit", "rojo"));
  g.appendChild(kpi("Dotación aprobada 2026", N(D.kpi.dotacion_horas)+" h",
    `${N2(D.kpi.dotacion_jornadas)} jornadas de 44 horas`, "inst"));
  g.appendChild(kpi("Horas vacantes sin proveer",
    N(D.vacantes.reduce((a,v)=>a+v.horas,0))+" h",
    `${D.vacantes.length} cargos aprobados y no provistos`, "amarillo"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-warn">
    <strong>Antes de pedir dotación nueva.</strong> Hay
    ${D.vacantes.length} cargos aprobados que siguen vacantes, entre ellos un
    médico, una matrona, una enfermera y cuatro TENS. Es capacidad ya autorizada
    que no está disponible, y es lo primero que el Servicio va a preguntar.</div>`));
  return f;
});

/* 8 ----------------------------------------------------------- ausentismo */
S("Ausentismo", "La capacidad real es menor que la aprobada", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>La capacidad real es menor que la
    aprobada</h2><p>Licencias médicas iniciadas entre enero y agosto de 2026,
    anualizadas. Como los meses de invierno concentran licencias respiratorias,
    la cifra anual puede estar algo sobreestimada y debe recalcularse al
    cierre.</p></div>`));

  const a = D.ausentismo.filter(x=>x.jornadas>0).slice(0,14);
  f.appendChild(card("Porcentaje de la jornada anual perdido por licencia médica",
    "La línea marca el 10%, el promedio de toda la dotación.",
    barrasH({datos:a.map(r=>({
      et:r.e, val:r.pct, color:C.inst500,
      tip:`<b>${r.e}</b><br>${N(r.dias)} días de licencia en ${r.episodios} episodios<br>
           Sobre ${N2(r.jornadas)} jornadas de 44 horas<br>
           Equivale a <b>${N2(r.jce)} JCE</b> al año`
    })), fmt:P1, fmtEje:P0, etAncho:168, filaH:25, ancho:800,
       ref:{v:0.107, rot:"Promedio 10,7%"},
       etiqueta:"Porcentaje de jornada perdido por estamento"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  const g = nodo(`<div class="grid g3"></div>`);
  g.appendChild(kpi("Jornadas perdidas al año", N2(D.kpi.jce_ausentismo)+" JCE",
    "Por licencia médica, toda la dotación", "rojo"));
  g.appendChild(kpi("De la jornada anual", "10,7%",
    "Promedio ponderado de la dotación", "amarillo"));
  g.appendChild(kpi("Contratos a honorarios",
    N(Object.values(D.honorarios).reduce((a,b)=>a+b,0)),
    "Fuera de la dotación, en su mayoría del Convenio SAR", "inst"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-info">
    <strong>Cómo se presenta esto.</strong> El ausentismo por licencia médica no
    es una brecha de dotación en sentido estricto: no se resuelve creando
    cargos, sino con reemplazos y medidas de salud laboral. Se informa porque la
    capacidad con que efectivamente se ejecuta la programación es menor que la
    nominal, y omitirlo lleva a comprometer metas que la dotación real no
    alcanza a cumplir.</div>`));
  return f;
});

/* 9 ------------------------------------------------------------ dotación */
S("Dotación 2026", "Lo que aprobó el Servicio de Salud", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Lo que aprobó el Servicio de
    Salud</h2><p>Resolución Exenta 5505, de 20 de noviembre de 2025. Ésta es la
    base legal sobre la que debe construirse la propuesta 2027, no una
    estimación interna.</p></div>`));

  const d = D.dotacion.slice().sort((a,b)=>(b.h26-b.h25)-(a.h26-a.h25));
  f.appendChild(card("Variación de horas semanales entre 2025 y 2026",
    "Azul oscuro: aumentó. Azul claro: disminuyó.",
    barrasH({datos:d.map(r=>({
      et:r.e, val:r.h26-r.h25,
      color:(r.h26-r.h25)>=0 ? C.inst600 : C.inst200,
      tip:`<b>${r.e}</b><br>2025: ${N(r.h25)} h · 2026: ${N(r.h26)} h<br>
           ${N2(r.jornadas)} jornadas de 44 horas
           ${r.nota?`<br><span class="l">${r.nota}</span>`:""}`
    })), dir:"ambos", fmt:N, etAncho:168, filaH:24, ancho:800,
       etiqueta:"Variación de dotación por estamento"})));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(card("Cargos vacantes de la dotación aprobada",
    "Horas autorizadas que hoy no están disponibles.",
    tabla([
      {t:"Unidad", k:"u"}, {t:"Categoría", k:"c"}, {t:"Cargo", k:"g"},
      {t:"Horas", k:"h", num:true}
    ], D.vacantes.map(v=>({u:v.unidad||"—", c:v.cat||"—", g:v.cargo,
       h:N(v.horas)})).concat([{__tot:true, u:"TOTAL", c:"", g:"",
       h:N(D.vacantes.reduce((a,v)=>a+v.horas,0))}]))));
  return f;
});

/* 10 -------------------------------------------------------- dotación 27 */
S("Dotación 2027", "La decisión del 30 de septiembre", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>La decisión del 30 de
    septiembre</h2><p>El artículo 11 de la Ley 19.378 obliga a presentar la
    dotación al Concejo Municipal antes del 30 de septiembre del año anterior a
    su entrada en vigencia. La población proyectada para 2027 es de
    ${N(D.meta.poblacion27)} inscritos.</p></div>`));

  const g = nodo(`<div class="grid g3"></div>`);
  g.appendChild(kpi("Escenario base", "63 jornadas",
    "Demanda declarada más crecimiento de inscritos", "amarillo"));
  g.appendChild(kpi("Con 20% de no presentación", "82 jornadas",
    "Costo en dotación de no gestionar la inasistencia", "rojo"));
  g.appendChild(kpi("Diferencia", "19 jornadas",
    "Es el argumento para la fijación de metas", "inst"));
  f.appendChild(g);

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-warn">
    <strong>Tres cifras que hay que depurar antes de firmar.</strong> Médico,
    Tecnólogo médico, Terapeuta ocupacional y Trabajador social declaran más
    horas indirectas que horas totales disponibles en el año. Eso infla su
    brecha y no resiste la revisión técnica del Servicio. Está detallado en la
    hoja Horas Indirectas del libro.</div>`));

  f.appendChild(nodo(`<div style="height:14px"></div>`));
  f.appendChild(card("Cómo leer el balance",
    "La brecha neta no sirve para decidir dotación.", nodo(`<ul class="lista">
      <li>La <b>brecha neta</b> de todos los estamentos compensa el excedente de
      TENS, administrativos, auxiliares y conductores contra el déficit de los
      estamentos clínicos. No debe usarse.</li>
      <li>El <b>déficit clínico</b> de ${N2(D.kpi.deficit_clinico)} JCE es la
      cifra que sustenta la solicitud.</li>
      <li>Las <b>${N(D.vacantes.reduce((a,v)=>a+v.horas,0))} horas vacantes</b>
      deben proveerse o explicarse antes de pedir cargos nuevos por el mismo
      concepto.</li>
      <li>Las <b>${N2(D.kpi.jce_ausentismo)} JCE</b> que se pierden por licencia
      médica se informan aparte: se resuelven con reemplazos, no con dotación.</li>
    </ul>`)));
  return f;
});

/* 11 ------------------------------------------------------------ decidir */
S("Qué decidir", "Lo que queda por resolver", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc"><h2>Lo que queda por resolver</h2>
    <p>Ya no falta ningún dato para medir: lo que queda son decisiones y dos
    consultas.</p></div>`));

  const items = [
    ["a-danger","Antes de cualquier informe",
     "Ejecutar y evaluar participativamente el Plan de Salud Comunitaria de la meta 8 antes de diciembre, y completar las metas odontológicas 3.1 y 3.2, que ya vienen en ritmo. Son las tres acciones más baratas para cruzar el 75% y que el componente variable se pague."],
    ["a-warn","Antes del 30 de septiembre",
     "Decidir si la propuesta de dotación 2027 se presenta en el escenario base (63 jornadas) o con no presentación (82). Y depurar las horas indirectas de médico, tecnólogo médico, terapeuta ocupacional y trabajo social, que hoy superan la jornada anual disponible."],
    ["a-warn","Antes del 31 de octubre",
     "La meta 3, altas odontológicas, no tiene prestación trazadora en la programación pese a que sí se ejecuta: 226 altas entre enero y agosto. Hay que declararla antes de la fijación de metas."],
    ["a-info","Campaña de cierre",
     "Concentrar el esfuerzo en compensar población diabética ya bajo control. Es la palanca más eficiente y la meta 4.A está a distancia alcanzable."],
    ["a-info","Consulta a estadística",
     "Confirmar si la carga de tamizaje cervicouterino es centralizada en el CESFAM. Las tres postas informan cero en el REM P12 de junio."],
    ["a-info","Depuración de la programación 2027",
     "Setenta y dos líneas de la programación 2026 no reproducen su propio cálculo, y hay tres pares de filas duplicadas. Está listado en la hoja Control de Carga."],
  ];
  const cont = nodo(`<div class="grid" style="gap:10px"></div>`);
  items.forEach(([t,tit,txt]) => cont.appendChild(nodo(
    `<div class="alerta ${t}"><strong>${tit}.</strong> ${txt}</div>`)));
  f.appendChild(cont);

  f.appendChild(nodo(`<div style="height:16px"></div>`));
  f.appendChild(nodo(`<div class="alerta a-info">
    El detalle completo, con fórmulas vivas y trazabilidad hasta la celda REM de
    origen, está en el libro <b>Programación Operativa 2026 · DAS Pozo
    Almonte.xlsx</b>, de 25 hojas.</div>`));
  return f;
});

/* ================================================================= montaje */
const nav = document.getElementById("nav");
const lienzo = document.getElementById("lienzo");
const tituloBarra = document.getElementById("tituloBarra");
const contador = document.getElementById("contador");
const progBar = document.getElementById("progBar");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
let actual = 0;
const montados = [];

SLIDES.forEach((s,i) => {
  const b = nodo(`<button type="button"><span class="n">${i+1}</span>${s.nom}</button>`);
  b.addEventListener("click", ()=>ir(i));
  nav.appendChild(b);
  const div = document.createElement("section");
  div.className = "slide";
  div.id = "s"+i;
  lienzo.appendChild(div);
  montados.push({div, hecho:false});
});

function ir(i){
  if (i<0 || i>=SLIDES.length) return;
  actual = i;
  const m = montados[i];
  if (!m.hecho){ m.div.appendChild(SLIDES[i].fn()); m.hecho = true; }
  montados.forEach((x,k)=>x.div.classList.toggle("on", k===i));
  nav.querySelectorAll("button").forEach((b,k)=>
    b.setAttribute("aria-current", String(k===i)));
  tituloBarra.textContent = SLIDES[i].titulo;
  contador.textContent = `${i+1} / ${SLIDES.length}`;
  progBar.style.width = ((i+1)/SLIDES.length*100).toFixed(1)+"%";
  btnPrev.disabled = i===0;
  btnNext.disabled = i===SLIDES.length-1;
  ocultarTip();
  window.scrollTo({top:0, behavior:"instant"});
  location.hash = "s"+i;
}
btnPrev.addEventListener("click", ()=>ir(actual-1));
btnNext.addEventListener("click", ()=>ir(actual+1));
document.addEventListener("keydown", e=>{
  if (e.target.matches("input,textarea")) return;
  if (e.key==="ArrowRight" || e.key==="PageDown"){ e.preventDefault(); ir(actual+1); }
  if (e.key==="ArrowLeft"  || e.key==="PageUp"){ e.preventDefault(); ir(actual-1); }
});
/* al imprimir se montan todas */
window.addEventListener("beforeprint", ()=>{
  montados.forEach((m,i)=>{ if(!m.hecho){ m.div.appendChild(SLIDES[i].fn());
    m.hecho=true; } });
});

const inicio = /^#s(\d+)$/.exec(location.hash);
ir(inicio ? Math.min(+inicio[1], SLIDES.length-1) : 0);
})();
