// ===============================
// BOXC0NTROL - script.js (PRO + PDF + CLIENTES)
// Salvar OS / Histórico / Kanban / Clientes / PDF Profissional
// ===============================

// === Montadoras e Modelos ===
const marcas = {
  "Chevrolet": ["Onix","Tracker","S10","Cruze","Spin","Camaro","Blazer"],
  "Ford": ["Ka","EcoSport","Ranger","Fusion","Edge","Mustang"],
  "Volkswagen": ["Gol","Polo","Virtus","T-Cross","Nivus","Jetta","Golf","Passat"],
  "Fiat": ["Uno","Mobi","Argo","Cronos","Toro","Strada","Punto","Fiorino"],
  "Toyota": ["Corolla","Yaris","Hilux","SW4","Etios","Prius","RAV4"],
  "Honda": ["Civic","Fit","HR-V","WR-V","CR-V","City","Accord"],
  "Renault": ["Kwid","Sandero","Logan","Duster","Captur","Stepway","Fluence"],
  "Hyundai": ["HB20","Creta","Tucson","Azera","Santa Fe","i30"],
  "Nissan": ["March","Versa","Kicks","Frontier","Sentra","Leaf","GT-R"],
  "Jeep": ["Renegade","Compass","Wrangler","Cherokee","Grand Cherokee"],
  "Citroën": ["C3","C4 Cactus","C4 Lounge","Aircross","Berlingo"],
  "Mitsubishi": ["L200","Outlander","ASX","Eclipse Cross","Pajero"],
  "Peugeot": ["208","2008","3008","308","5008","Traveller"],
  "BMW": ["Série 1","Série 3","Série 5","X1","X3","X5","X6","X7","i3","i8"],
  "Mercedes-Benz": ["A-Class","C-Class","E-Class","S-Class","GLA","GLC","GLE","GLS"],
  "Audi": ["A1","A3","A4","A5","A6","A7","A8","Q3","Q5","Q7","Q8","TT","R8"],
  "Kia": ["Picanto","Rio","Cerato","Sportage","Sorento","Stinger"],
  "Suzuki": ["Swift","Vitara","Jimny"],
  "Chery": ["Tiggo 2","Tiggo 5","Tiggo 7","Arrizo 5","Arrizo 6"],
  "Land Rover": ["Defender","Discovery","Range Rover","Evoque"],
  "Volvo": ["XC40","XC60","XC90","S60","S90","V40","V60","V90"],
  "Troller": ["T4"],
  "Mini": ["Cooper","Cooper S","Cooper SE","Countryman"],
  "Porsche": ["911","Cayenne","Macan","Panamera","Taycan"],
  "Jaguar": ["XE","XF","XJ","F-Pace","E-Pace","I-Pace"],
  "Lexus": ["NX","RX","ES","LS","UX","LX"],
  "Infiniti": ["Q50","Q60","QX30","QX50","QX60","QX80"],
  "Maserati": ["Ghibli","Levante","Quattroporte","MC20"],
  "Ferrari": ["488","Portofino","F8","Roma","SF90"],
  "Lamborghini": ["Huracan","Aventador","Urus"]
};

// ===============================
// CONFIG (dados do cabeçalho do PDF)
// ===============================
const EMPRESA = {
  nome: "BoxControl Gestão Automotiva",
  subtitulo: "Ordem de Serviço / Orçamento",
  telefone: "",
  endereco: ""
};

// ===============================
// STORAGE HELPERS
// ===============================
function safeJSONParse(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  } catch(e){
    return fallback;
  }
}
function getClientes(){ return safeJSONParse("clientes", []); }
function setClientes(arr){ localStorage.setItem("clientes", JSON.stringify(arr)); }

function getHistorico(){
  const hist = safeJSONParse("historico", []);
  return Array.isArray(hist) ? hist : [];
}
function setHistorico(arr){ localStorage.setItem("historico", JSON.stringify(arr)); }

function limparKanbanStateLegado(){
  try { localStorage.removeItem("kanbanState"); } catch(e){}
}

// ===============================
// UTIL
// ===============================
function pad2(n){ return String(n).padStart(2,"0"); }

function formatBRL(n){
  const v = Number(n || 0);
  return v.toFixed(2).replace(".", ",");
}

function nowISO(){
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function gerarNumeroOS(){
  // OS-AAAAMMDD-HHMM-XXXX
  const d = new Date();
  const rand = Math.floor(Math.random()*9000) + 1000;
  return `OS-${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}-${rand}`;
}

// ===============================
// SELECTS
// ===============================
function gerarSelectMarcas(){
  let options = '<option value="">Selecione a Marca</option>';
  Object.keys(marcas).forEach(m => options += `<option value="${m}">${m}</option>`);
  return `<select id="selectMarca" required>${options}</select>`;
}
function gerarSelectModelo(){
  return `<select id="selectModelo" required><option value="">Selecione o Modelo</option></select>`;
}
function gerarSelectAno(){
  const anoAtual = new Date().getFullYear();
  let options = '<option value="">Selecione o Ano</option>';
  for(let i=anoAtual; i>=1980; i--) options += `<option value="${i}">${i}</option>`;
  return `<select id="selectAno" required>${options}</select>`;
}

function bindMarcaModelo(){
  const selMarca = document.getElementById("selectMarca");
  const selModelo = document.getElementById("selectModelo");
  if(!selMarca || !selModelo) return;

  selMarca.addEventListener("change", ()=>{
    selModelo.innerHTML = `<option value="">Selecione o Modelo</option>`;
    const m = selMarca.value;
    if(m && marcas[m]){
      marcas[m].forEach(md => selModelo.innerHTML += `<option value="${md}">${md}</option>`);
    }
  });
}

function updateModelo(modelo){
  const selModelo = document.getElementById("selectModelo");
  const selMarca = document.getElementById("selectMarca");
  if(!selModelo || !selMarca) return;

  selModelo.innerHTML = `<option value="">Selecione o Modelo</option>`;
  const marca = selMarca.value;
  if(marca && marcas[marca]){
    marcas[marca].forEach(m => selModelo.innerHTML += `<option value="${m}">${m}</option>`);
  }
  if(modelo) selModelo.value = modelo;
}

// ===============================
// UI / NAVEGAÇÃO
// ===============================
let contentArea = null;

function initNavigation(){
  const menuItems = document.querySelectorAll(".menu-item");
  const cardActions = document.querySelectorAll(".card");

  menuItems.forEach(item=>{
    item.addEventListener("click", ()=>{
      const p = item.dataset.page || item.dataset.action || item.getAttribute("data-page") || "";
      loadPageSmart(p || item.textContent || "");
    });
  });

  cardActions.forEach(card=>{
    card.addEventListener("click", ()=>{
      const a = card.dataset.action || card.dataset.page || card.getAttribute("data-action") || "";
      loadPageSmart(a || card.textContent || "");
    });
  });
}

function loadPageSmart(pageRaw){
  const page = (pageRaw || "").toString().toLowerCase().trim();

  if(page.includes("ordem") || page.includes("nova-ordem") || page.includes("os")){
    renderNovaOrdem();
    return;
  }
  if(page.includes("cadastro-cliente") || (page.includes("cliente") && !page.includes("clientes"))){
    renderNovoCliente();
    return;
  }
  if(page === "clientes" || page.includes("lista-clientes")){
    renderClientesArea();
    return;
  }
  if(page.includes("checklist")){
    renderChecklist();
    return;
  }
  if(page.includes("carro") || page.includes("servico") || page.includes("kanban")){
    renderCarrosServico();
    return;
  }
  if(page.includes("hist")){
    renderHistorico();
    return;
  }

  if(contentArea) contentArea.innerHTML = `<h2>Bem-vindo ao BoxControl!</h2>`;
}

// ===============================
// ORDEM DE SERVIÇO
// ===============================
function renderNovaOrdem(){
  const clientes = getClientes();

  let clienteOptions = `<option value="">Selecione o Cliente</option>`;
  clientes.forEach((c, i)=> clienteOptions += `<option value="${i}">${c.cliente}</option>`);

  if(contentArea){
    contentArea.innerHTML = `
      <h2>Nova Ordem de Serviço</h2>

      <form id="formOrdem">
        <label><strong>Número da OS</strong></label>
        <input type="text" id="osNumero" readonly value="${gerarNumeroOS()}">

        <select id="selectCliente" required>${clienteOptions}</select>

        <input type="text" id="placa" placeholder="Placa do Veículo" required>
        <input type="text" id="cor" placeholder="Cor do Veículo" required>

        ${gerarSelectMarcas()}
        ${gerarSelectModelo()}
        ${gerarSelectAno()}

        <h3>Itens / Peças</h3>
        <table id="itensTable">
          <thead><tr><th>Qtd</th><th>Item</th><th>Valor Unit</th><th>Ações</th></tr></thead>
          <tbody></tbody>
        </table>
        <button type="button" id="addItem">Adicionar Item</button>

        <h3>Mão de Obra</h3>
        <table id="maoTable">
          <thead><tr><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
          <tbody></tbody>
        </table>
        <button type="button" id="addMao">Adicionar Mão de Obra</button>

        <h3>Subtotal: R$ <span id="subtotal">0.00</span></h3>

        <div class="btn-row">
          <button type="submit" id="btnSalvarOS">Salvar OS</button>
          <button type="button" id="exportPDF" class="btn-muted">Exportar PDF (Prévia)</button>
          <button type="button" id="novoNumeroOS" class="btn-danger">Gerar novo nº OS</button>
        </div>
      </form>
    `;
  }

  bindMarcaModelo();
  bindClientesOrdem();
  bindAddItem();
  bindAddMao();
  bindSalvarOS();
  bindExportPDF();
  bindNovoNumeroOS();
  updateSubtotal();

  // Atualiza Kanban fixo (se existir)
  renderKanbanFromHistoricoIfExists();
}

function bindNovoNumeroOS(){
  const btn = document.getElementById("novoNumeroOS");
  const osNumero = document.getElementById("osNumero");
  if(!btn || !osNumero) return;
  btn.addEventListener("click", ()=>{
    osNumero.value = gerarNumeroOS();
  });
}

function bindClientesOrdem(){
  const selectCliente = document.getElementById("selectCliente");
  if(!selectCliente) return;

  selectCliente.addEventListener("change", ()=>{
    const idx = selectCliente.value;
    if(idx === "") return;

    const c = getClientes()[Number(idx)];
    if(!c) return;

    const placa = document.getElementById("placa");
    const cor = document.getElementById("cor");
    const selMarca = document.getElementById("selectMarca");
    const selAno = document.getElementById("selectAno");

    if(placa) placa.value = c.placa || "";
    if(cor) cor.value = c.cor || "";
    if(selMarca) selMarca.value = c.marca || "";
    updateModelo(c.modelo);
    if(selAno) selAno.value = c.ano || "";
  });
}

function bindAddItem(){
  const btn = document.getElementById("addItem");
  if(!btn) return;

  btn.addEventListener("click", ()=>{
    const tbody = document.querySelector("#itensTable tbody");
    if(!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="number" value="1" min="0"></td>
      <td><input type="text" value=""></td>
      <td><input type="number" value="0" min="0" step="0.01"></td>
      <td><button type="button" class="removeItem">Remover</button></td>
    `;
    tbody.appendChild(tr);

    tr.querySelector(".removeItem").addEventListener("click", ()=>{
      tr.remove();
      updateSubtotal();
    });

    tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", updateSubtotal));
  });
}

function bindAddMao(){
  const btn = document.getElementById("addMao");
  if(!btn) return;

  btn.addEventListener("click", ()=>{
    const tbody = document.querySelector("#maoTable tbody");
    if(!tbody) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value=""></td>
      <td><input type="number" value="0" min="0" step="0.01"></td>
      <td><button type="button" class="removeMao">Remover</button></td>
    `;
    tbody.appendChild(tr);

    tr.querySelector(".removeMao").addEventListener("click", ()=>{
      tr.remove();
      updateSubtotal();
    });

    tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", updateSubtotal));
  });
}

function updateSubtotal(){
  const subEl = document.getElementById("subtotal");
  if(!subEl) return;

  let total = 0;

  document.querySelectorAll("#itensTable tbody tr").forEach(tr=>{
    const qtd = Number(tr.children[0]?.querySelector("input")?.value || 0);
    const val = Number(tr.children[2]?.querySelector("input")?.value || 0);
    total += qtd * val;
  });

  document.querySelectorAll("#maoTable tbody tr").forEach(tr=>{
    total += Number(tr.children[1]?.querySelector("input")?.value || 0);
  });

  subEl.textContent = total.toFixed(2);
}

function coletarOSDoFormulario(){
  const selCliente = document.getElementById("selectCliente");
  const cliente = selCliente?.selectedOptions?.[0]?.text || "";
  const placa = (document.getElementById("placa")?.value || "").trim();
  const cor = (document.getElementById("cor")?.value || "").trim();
  const marca = (document.getElementById("selectMarca")?.value || "").trim();
  const modelo = (document.getElementById("selectModelo")?.value || "").trim();
  const ano = (document.getElementById("selectAno")?.value || "").trim();

  const osNumero = (document.getElementById("osNumero")?.value || "").trim() || gerarNumeroOS();

  const itens = [];
  document.querySelectorAll("#itensTable tbody tr").forEach(tr=>{
    itens.push({
      quantidade: (tr.children[0]?.querySelector("input")?.value || "0"),
      item: (tr.children[1]?.querySelector("input")?.value || ""),
      valor: (tr.children[2]?.querySelector("input")?.value || "0")
    });
  });

  const mao = [];
  document.querySelectorAll("#maoTable tbody tr").forEach(tr=>{
    mao.push({
      descricao: (tr.children[0]?.querySelector("input")?.value || ""),
      valor: (tr.children[1]?.querySelector("input")?.value || "0")
    });
  });

  const subtotal = Number(document.getElementById("subtotal")?.textContent || 0);

  return {
    id: Date.now().toString(),
    osNumero,
    cliente, placa, cor, marca, modelo, ano,
    itens, mao, subtotal,
    status: "Aguardando",
    dataHora: new Date().toLocaleString()
  };
}

// ✅ SALVAR OS
function bindSalvarOS(){
  const form = document.getElementById("formOrdem");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const selCliente = document.getElementById("selectCliente");
    const cliente = selCliente?.selectedOptions?.[0]?.text || "";

    if(!cliente){
      alert("Selecione um cliente antes de salvar.");
      return;
    }

    const os = coletarOSDoFormulario();
    os.status = "Aguardando";

    const historico = getHistorico();
    historico.push(os);
    setHistorico(historico);

    alert("Ordem de Serviço salva com sucesso!");

    renderKanbanFromHistoricoIfExists();

    // limpa form, mas gera novo nº OS
    form.reset();

    const osNumero = document.getElementById("osNumero");
    if(osNumero) osNumero.value = gerarNumeroOS();

    // limpa tabelas
    const itensBody = document.querySelector("#itensTable tbody");
    const maoBody = document.querySelector("#maoTable tbody");
    if(itensBody) itensBody.innerHTML = "";
    if(maoBody) maoBody.innerHTML = "";
    updateSubtotal();
  });
}

// ===============================
// PDF PROFISSIONAL (jsPDF)
// ===============================
function ensureJsPDF(){
  return !!(window.jspdf && window.jspdf.jsPDF);
}

function drawLine(doc, x1,y1,x2,y2){
  doc.setLineWidth(0.2);
  doc.line(x1,y1,x2,y2);
}

function pdfHeader(doc, os){
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(EMPRESA.nome, 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(EMPRESA.subtitulo, 14, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Nº: ${os.osNumero || os.id || "-"}`, 150, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data: ${os.dataHora || nowISO()}`, 150, 22);

  drawLine(doc, 14, 26, 196, 26);
}

function pdfClienteVeiculo(doc, os, startY){
  let y = startY;

  doc.setFont("helvetica","bold");
  doc.setFontSize(11);
  doc.text("Dados do Cliente", 14, y);
  y += 6;

  doc.setFont("helvetica","normal");
  doc.setFontSize(10);
  doc.text(`Cliente: ${os.cliente || "-"}`, 14, y); y += 5;

  doc.setFont("helvetica","bold");
  doc.text("Veículo", 14, y); y += 6;

  doc.setFont("helvetica","normal");
  doc.text(`Marca/Modelo: ${(os.marca||"") + " " + (os.modelo||"")}`.trim() || "-", 14, y); y += 5;
  doc.text(`Ano: ${os.ano || "-"}    Placa: ${os.placa || "-"}    Cor: ${os.cor || "-"}`, 14, y); y += 6;

  drawLine(doc, 14, y, 196, y);
  return y + 6;
}

function pdfTabela(doc, titulo, headers, rows, startY){
  let y = startY;

  doc.setFont("helvetica","bold");
  doc.setFontSize(11);
  doc.text(titulo, 14, y);
  y += 6;

  doc.setFontSize(10);
  // Cabeçalho
  doc.setFont("helvetica","bold");
  let x = 14;
  const colWidths = [18, 120, 28]; // padrão 3 colunas (ajustável)
  for(let i=0;i<headers.length;i++){
    doc.text(String(headers[i]), x, y);
    x += colWidths[i] || 40;
  }
  y += 2;
  drawLine(doc, 14, y, 196, y);
  y += 6;

  doc.setFont("helvetica","normal");

  rows.forEach(r=>{
    if(y > 270){ doc.addPage(); y = 20; }
    let xx = 14;
    for(let i=0;i<r.length;i++){
      const txt = String(r[i] ?? "");
      doc.text(txt, xx, y);
      xx += colWidths[i] || 40;
    }
    y += 6;
  });

  return y + 4;
}

function pdfTotaisAssinatura(doc, os, startY){
  let y = startY;

  drawLine(doc, 14, y, 196, y);
  y += 8;

  doc.setFont("helvetica","bold");
  doc.setFontSize(12);
  doc.text(`TOTAL: R$ ${formatBRL(os.subtotal)}`, 14, y);
  y += 10;

  doc.setFont("helvetica","normal");
  doc.setFontSize(10);
  doc.text("Observações:", 14, y); y += 6;
  doc.text("- Serviços/peças sujeitos à aprovação do cliente.", 14, y); y += 5;
  doc.text("- Garantia conforme condições da oficina.", 14, y); y += 10;

  doc.text("Assinatura do Cliente:", 14, y);
  drawLine(doc, 55, y, 196, y);
  y += 10;

  doc.setFontSize(9);
  doc.text("Documento gerado pelo BoxControl.", 14, 290);
}

function gerarPDF_OS(os){
  if(!ensureJsPDF()){
    alert("jsPDF não carregou. Verifique o script do jsPDF no HTML.");
    return null;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  pdfHeader(doc, os);

  let y = pdfClienteVeiculo(doc, os, 34);

  // Itens/Peças
  const itensRows = (os.itens || [])
    .filter(it => (it.item || "").trim() !== "" || Number(it.valor||0) > 0)
    .map(it => {
      const qtd = String(it.quantidade ?? "0");
      const item = String(it.item ?? "");
      const v = formatBRL(it.valor ?? 0);
      return [qtd, item, `R$ ${v}`];
    });

  y = pdfTabela(doc, "Itens / Peças", ["Qtd", "Descrição", "Valor"], itensRows.length ? itensRows : [["-", "Nenhum item informado", "-"]], y);

  // Mão de Obra
  const maoRows = (os.mao || [])
    .filter(m => (m.descricao || "").trim() !== "" || Number(m.valor||0) > 0)
    .map(m => ["-", String(m.descricao ?? ""), `R$ ${formatBRL(m.valor ?? 0)}`]);

  y = pdfTabela(doc, "Mão de Obra", ["", "Descrição", "Valor"], maoRows.length ? maoRows : [["-", "Nenhuma mão de obra informada", "-"]], y);

  pdfTotaisAssinatura(doc, os, y);

  return doc;
}

function abrirPDFemNovaAba(doc, filename){
  try{
    const url = doc.output("bloburl");
    window.open(url, "_blank");
  } catch(e){
    // fallback: download
    doc.save(filename || "OS.pdf");
  }
}

function bindExportPDF(){
  const btn = document.getElementById("exportPDF");
  if(!btn) return;

  btn.addEventListener("click", ()=>{
    const selCliente = document.getElementById("selectCliente");
    const cliente = selCliente?.selectedOptions?.[0]?.text || "";

    if(!cliente){
      alert("Selecione um cliente para gerar o PDF.");
      return;
    }

    const osPreview = coletarOSDoFormulario();
    osPreview.dataHora = new Date().toLocaleString();

    const doc = gerarPDF_OS(osPreview);
    if(!doc) return;

    // abre em nova aba
    abrirPDFemNovaAba(doc, `OS_${osPreview.osNumero || "preview"}.pdf`);
  });
}

// ===============================
// KANBAN
// - Clique no card abre PDF da OS
// - Drag & Drop muda status e salva
// ===============================
let draggedCard = null;

function findKanbanColumns(){
  const colA = document.querySelector(".aguardando");
  const colE = document.querySelector(".em-servico");
  const colF = document.querySelector(".finalizado");
  if(!colA || !colE || !colF) return null;
  return { colA, colE, colF };
}

function criarCardKanban(os){
  const card = document.createElement("div");
  card.className = "card-kanban";
  card.setAttribute("draggable", "true");
  card.dataset.osId = os.id;

  const titulo = `${os.cliente || "Sem cliente"} - ${os.modelo || "Veículo"}`;
  const sub = `${os.placa ? "Placa: " + os.placa : ""} | ${os.osNumero || ""}`.trim();

  card.innerHTML = `
    <div><strong>${titulo}</strong></div>
    <small>${sub}</small>
  `;

  // Drag
  card.addEventListener("dragstart", ()=>{
    draggedCard = card;
    setTimeout(()=>{ card.style.display = "none"; }, 0);
  });
  card.addEventListener("dragend", ()=>{
    setTimeout(()=>{
      card.style.display = "block";
      draggedCard = null;
    }, 0);
  });

  // ✅ Clique abre PDF da OS salva
  card.addEventListener("click", ()=>{
    abrirPDFdaOSPorId(os.id);
  });

  return card;
}

function enableDropOnColumn(col, status){
  if(col.dataset.dropBound === "1") return; // evita duplicar listeners
  col.dataset.dropBound = "1";

  col.addEventListener("dragover", (e)=> e.preventDefault());
  col.addEventListener("drop", ()=>{
    if(!draggedCard) return;
    col.appendChild(draggedCard);

    const osId = draggedCard.dataset.osId;
    const historico = getHistorico();
    const idx = historico.findIndex(x => x.id === osId);
    if(idx > -1){
      historico[idx].status = status;
      setHistorico(historico);
    }
  });
}

function renderKanbanFromHistoricoIfExists(){
  const cols = findKanbanColumns();
  if(!cols) return;

  const historico = getHistorico();

  // mantém os títulos e limpa cards antigos
  [cols.colA, cols.colE, cols.colF].forEach(col=>{
    const h2 = col.querySelector("h2");
    col.innerHTML = "";
    if(h2) col.appendChild(h2);
  });

  historico.forEach(os=>{
    if(!os.status) os.status = "Aguardando";
    if(!os.id) os.id = Date.now().toString() + Math.random().toString(16).slice(2);
    if(!os.osNumero) os.osNumero = gerarNumeroOS();

    const card = criarCardKanban(os);

    if(os.status === "Aguardando") cols.colA.appendChild(card);
    else if(os.status === "Em Serviço") cols.colE.appendChild(card);
    else cols.colF.appendChild(card);
  });

  enableDropOnColumn(cols.colA, "Aguardando");
  enableDropOnColumn(cols.colE, "Em Serviço");
  enableDropOnColumn(cols.colF, "Finalizado");
}

function abrirPDFdaOSPorId(osId){
  const historico = getHistorico();
  const os = historico.find(x => x.id === osId);
  if(!os){
    alert("OS não encontrada no histórico.");
    return;
  }
  const doc = gerarPDF_OS(os);
  if(!doc) return;
  abrirPDFemNovaAba(doc, `OS_${os.osNumero || os.id}.pdf`);
}

// Página dedicada do Kanban
function renderCarrosServico(){
  if(!contentArea) return;

  contentArea.innerHTML = `
    <h2>Carros em Serviço</h2>
    <p>Clique em um card do Kanban para abrir o PDF da OS.</p>
    <div class="kanban">
      <div class="column aguardando"><h2>Aguardando</h2></div>
      <div class="column em-servico"><h2>Em Serviço</h2></div>
      <div class="column finalizado"><h2>Finalizado + Entregue</h2></div>
    </div>
  `;

  renderKanbanFromHistoricoIfExists();
}

// ===============================
// HISTÓRICO
// - Lista OS e abre PDF ao clicar
// ===============================
function renderHistorico(){
  if(!contentArea) return;

  const historico = getHistorico();
  if(historico.length === 0){
    contentArea.innerHTML = `<h2>Histórico de Serviços</h2><p>Nenhum serviço realizado ainda.</p>`;
    return;
  }

  let html = `<h2>Histórico de Serviços</h2>`;
  historico.slice().reverse().forEach((os)=>{
    html += `
      <div class="history-item" data-osid="${os.id}">
        <strong>${os.osNumero || ""}</strong> — ${os.dataHora || ""}<br/>
        ${os.cliente || ""} — ${os.marca || ""} ${os.modelo || ""} (${os.placa || ""})<br/>
        <span class="pill">Status: ${os.status || ""}</span>
        <span class="pill">Total: R$ ${formatBRL(os.subtotal)}</span>
      </div>
    `;
  });

  contentArea.innerHTML = html;

  document.querySelectorAll(".history-item").forEach(div=>{
    div.addEventListener("click", ()=>{
      abrirPDFdaOSPorId(div.dataset.osid);
    });
  });
}

// ===============================
// CLIENTES (NOVO)
// - lista clientes
// - mostra serviços do cliente
// ===============================
function renderClientesArea(){
  if(!contentArea) return;

  const clientes = getClientes();
  const historico = getHistorico();

  if(clientes.length === 0){
    contentArea.innerHTML = `
      <h2>Clientes</h2>
      <p>Nenhum cliente cadastrado ainda.</p>
    `;
    return;
  }

  let html = `<h2>Clientes</h2>
    <p>Clique em um cliente para ver todos os serviços (OS) e abrir PDF.</p>
  `;

  clientes.forEach((c, idx)=>{
    const count = historico.filter(os => (os.cliente || "").trim() === (c.cliente || "").trim()).length;
    html += `
      <div class="client-item" data-idx="${idx}">
        <div>
          <strong>${c.cliente}</strong><br/>
          <small>${c.telefone || ""} ${c.placa ? " | Placa: " + c.placa : ""}</small>
        </div>
        <span class="pill">${count} serviço(s)</span>
      </div>
    `;
  });

  contentArea.innerHTML = html;

  document.querySelectorAll(".client-item").forEach(div=>{
    div.addEventListener("click", ()=>{
      const idx = Number(div.dataset.idx);
      renderDetalheCliente(idx);
    });
  });
}

function renderDetalheCliente(idx){
  if(!contentArea) return;

  const clientes = getClientes();
  const c = clientes[idx];
  if(!c){
    contentArea.innerHTML = `<h2>Cliente</h2><p>Cliente não encontrado.</p>`;
    return;
  }

  const historico = getHistorico().filter(os => (os.cliente || "").trim() === (c.cliente || "").trim())
    .sort((a,b)=> (b.id||"").localeCompare(a.id||""));

  let html = `
    <h2>Cliente: ${c.cliente}</h2>
    <div class="pill">Telefone: ${c.telefone || "-"}</div>
    <div class="pill">Endereço: ${c.endereco || "-"}</div>
    <div class="pill">Veículo: ${(c.marca||"") + " " + (c.modelo||"")} ${(c.ano||"") ? "(" + c.ano + ")" : ""}</div>
    <div class="pill">Placa: ${c.placa || "-"}</div>
    <div class="pill">Cor: ${c.cor || "-"}</div>
    <div style="height:10px"></div>
    <button id="voltarClientes" class="btn-muted">← Voltar</button>
    <div style="height:10px"></div>
    <h3>Serviços (OS)</h3>
  `;

  if(historico.length === 0){
    html += `<p>Nenhum serviço encontrado para este cliente.</p>`;
  } else {
    historico.forEach(os=>{
      html += `
        <div class="os-item" data-osid="${os.id}">
          <strong>${os.osNumero || ""}</strong> — ${os.dataHora || ""}<br/>
          ${os.marca || ""} ${os.modelo || ""} (${os.placa || ""})<br/>
          <span class="pill">Status: ${os.status || ""}</span>
          <span class="pill">Total: R$ ${formatBRL(os.subtotal)}</span>
          <span class="pill">Abrir PDF</span>
        </div>
      `;
    });
  }

  contentArea.innerHTML = html;

  document.getElementById("voltarClientes")?.addEventListener("click", renderClientesArea);

  document.querySelectorAll(".os-item").forEach(div=>{
    div.addEventListener("click", ()=>{
      abrirPDFdaOSPorId(div.dataset.osid);
    });
  });
}

// ===============================
// CLIENTE (CADASTRO)
// ===============================
function renderNovoCliente(){
  if(!contentArea) return;

  contentArea.innerHTML = `
    <h2>Novo Cliente</h2>
    <form id="formCliente">
      <input type="text" placeholder="Nome" required>
      <input type="text" placeholder="Endereço" required>
      <input type="tel" placeholder="Telefone" required>
      <input type="text" placeholder="Placa do Veículo" required>
      <input type="text" placeholder="Cor do Veículo" required>
      ${gerarSelectMarcas()}
      ${gerarSelectModelo()}
      ${gerarSelectAno()}
      <button type="submit">Salvar Cliente</button>
    </form>
  `;

  bindMarcaModelo();

  document.getElementById("formCliente").addEventListener("submit", (e)=>{
    e.preventDefault();
    const form = e.target;

    const cliente = form.querySelector('input[placeholder="Nome"]').value.trim();
    const endereco = form.querySelector('input[placeholder="Endereço"]').value.trim();
    const telefone = form.querySelector('input[placeholder="Telefone"]').value.trim();
    const placa = form.querySelector('input[placeholder="Placa do Veículo"]').value.trim();
    const cor = form.querySelector('input[placeholder="Cor do Veículo"]').value.trim();

    const marca = document.getElementById("selectMarca")?.value || "";
    const modelo = document.getElementById("selectModelo")?.value || "";
    const ano = document.getElementById("selectAno")?.value || "";

    const clientes = getClientes();
    clientes.push({ cliente, endereco, telefone, placa, cor, marca, modelo, ano });
    setClientes(clientes);

    alert("Cliente salvo com sucesso!");
    form.reset();
  });
}

// ===============================
// CHECKLIST (simples)
// ===============================
function renderChecklist(){
  if(!contentArea) return;

  const clientes = getClientes();
  let options = `<option value="">Selecione o Cliente</option>`;
  clientes.forEach((c,i)=> options += `<option value="${i}">${c.cliente}</option>`);

  contentArea.innerHTML = `
    <h2>Novo Checklist</h2>
    <form id="formChecklist">
      <select id="selectChecklistCliente">${options}</select>
      <input type="file" id="fotoChecklist" multiple>
      <button type="submit">Salvar Checklist</button>
    </form>
  `;

  document.getElementById("formChecklist").addEventListener("submit",(e)=>{
    e.preventDefault();
    alert("Checklist salvo!");
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", ()=>{
  contentArea = document.getElementById("content-area");

  limparKanbanStateLegado();
  initNavigation();

  // Popula Kanban fixo do dashboard
  renderKanbanFromHistoricoIfExists();
});
