"""
Interactive Security – patch script
Run this once in your Codespaces terminal: python3 patch.py
It modifies server.js, index.html, app.js and styles.css in place.
"""
import re, subprocess

# ── 1. styles.css ─────────────────────────────────────────────────────────────
with open('styles.css', 'r') as f: css = f.read()
css = css.replace(
    '.approval-table { overflow: hidden;',
    '.approval-table { overflow-x: auto; -webkit-overflow-scrolling: touch;'
)
marker = '/* ── Sales request list: horizontal scroll'
if marker in css:
    css = css[:css.index(marker)].rstrip() + '\n'
with open('styles.css', 'w') as f: f.write(css)
print('✓ styles.css')

# ── 2. server.js ──────────────────────────────────────────────────────────────
with open('server.js', 'r') as f: js = f.read()

if '"finance_age_analysis"' not in js:
    js = js.replace(
        '  "sales_quotation_requests",\n];',
        '  "sales_quotation_requests",\n  "finance_age_analysis",\n];'
    )

if '"finance_balances"' not in js:
    js = js.replace(
        '"password_reset_tokens"].forEach',
        '"password_reset_tokens",\n   "finance_balances"].forEach'
    )

if '/api/finance/balances' not in js:
    finance_routes = '''  // ── Finance Age Analysis ─────────────────────────────────────────────────

  if (req.method === "GET" && url.pathname === "/api/finance/balances") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "finance_age_analysis")) return json(res, 403, { error: "Access denied" });
    const db = readDb();
    return json(res, 200, { balances: db.finance_balances || [] });
  }

  if (req.method === "POST" && url.pathname === "/api/finance/balances") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "finance_age_analysis")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    if (!body.client_name || String(body.client_name).trim() === "") return json(res, 400, { error: "Client name is required." });
    const db = readDb();
    if (!Array.isArray(db.finance_balances)) db.finance_balances = [];
    const now = new Date().toISOString();
    const toNum = (v) => Number(v) || 0;
    const isNew = !body.id;
    const id = body.id || crypto.randomUUID();
    const current=toNum(body.current),days30=toNum(body.days_30),days60=toNum(body.days_60);
    const days90=toNum(body.days_90),days120=toNum(body.days_120_plus);
    const total=current+days30+days60+days90+days120;
    const record = { id, client_name: String(body.client_name).trim(),
      account_number: String(body.account_number||"").trim(), current,
      days_30:days30, days_60:days60, days_90:days90, days_120_plus:days120, total,
      notes: String(body.notes||"").trim(), last_updated: String(body.last_updated||now.slice(0,10)),
      created_at: isNew ? now : (db.finance_balances.find((r)=>r.id===id)?.created_at||now),
      updated_at: now };
    const idx=db.finance_balances.findIndex((r)=>r.id===id);
    if (idx>=0) db.finance_balances[idx]=record; else db.finance_balances.push(record);
    writeAudit(db, isNew?"Added finance balance record":"Updated finance balance record",
      session,"Finance",record.client_name,"Total: R"+total.toFixed(2));
    writeDb(db);
    return json(res, 200, { balance: record });
  }

  if (req.method === "DELETE" && url.pathname === "/api/finance/balances") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "finance_age_analysis")) return json(res, 403, { error: "Access denied" });
    const id = url.searchParams.get("id");
    if (!id) return json(res, 400, { error: "id is required" });
    const db = readDb();
    if (!Array.isArray(db.finance_balances)) db.finance_balances = [];
    const record = db.finance_balances.find((r)=>r.id===id);
    db.finance_balances = db.finance_balances.filter((r)=>r.id!==id);
    writeAudit(db,"Deleted finance balance record",session,"Finance",record?.client_name||id,"");
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/finance/import") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "finance_age_analysis")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    if (!Array.isArray(body.rows)||body.rows.length===0) return json(res,400,{error:"No rows provided."});
    const db = readDb();
    if (!Array.isArray(db.finance_balances)) db.finance_balances = [];
    const now=new Date().toISOString();
    const toNum=(v)=>Number(String(v).replace(/[^0-9.\\-]/g,""))||0;
    let imported=0; const errors=[];
    body.rows.forEach((row,i)=>{
      const clientName=String(row.client_name||"").trim();
      if(!clientName){errors.push("Row "+(i+1)+": missing client_name");return;}
      const current=toNum(row.current),days30=toNum(row.days_30),days60=toNum(row.days_60);
      const days90=toNum(row.days_90),days120=toNum(row.days_120_plus);
      const total=current+days30+days60+days90+days120;
      const existing=db.finance_balances.find((r)=>r.client_name.toLowerCase()===clientName.toLowerCase());
      const record={id:existing?.id||crypto.randomUUID(),client_name:clientName,
        account_number:String(row.account_number||existing?.account_number||"").trim(),
        current,days_30:days30,days_60:days60,days_90:days90,days_120_plus:days120,total,
        notes:String(row.notes||existing?.notes||"").trim(),
        last_updated:String(row.last_updated||now.slice(0,10)),
        created_at:existing?.created_at||now,updated_at:now};
      if(existing){const idx=db.finance_balances.findIndex((r)=>r.id===existing.id);db.finance_balances[idx]=record;}
      else db.finance_balances.push(record);
      imported++;
    });
    writeAudit(db,"Imported finance balance records",session,"Finance",imported+" records",
      errors.length?"Errors: "+errors.join("; "):"");
    writeDb(db);
    return json(res, 200, { imported, errors });
  }

'''
    setup_marker = '  // ── First-time setup routes'
    if setup_marker in js:
        js = js.replace(setup_marker, finance_routes + setup_marker)
    else:
        js = js.replace('  return json(res, 404, { error: "API route not found" });',
                        finance_routes + '  return json(res, 404, { error: "API route not found" });')

with open('server.js', 'w') as f: f.write(js)
print('✓ server.js')

# ── 3. index.html ─────────────────────────────────────────────────────────────
with open('index.html', 'r') as f: html = f.read()

if 'data-section="finance"' not in html:
    audit_btn_end = html.find('data-section="audit"')
    audit_btn_end = html.find('</button>', audit_btn_end) + len('</button>')
    finance_nav = '\n          <button class="nav-item" type="button" data-section="finance"><svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg><span class="nav-label">Finance Age Analysis</span></button>'
    html = html[:audit_btn_end] + finance_nav + html[audit_btn_end:]

if 'id="finance-section"' not in html:
    finance_section = '''
        <section class="hidden-state" id="finance-section" hidden>
          <h2>Finance Age Analysis</h2>
          <p>Debtor age analysis, outstanding balances, and collections oversight.</p>
          <div class="approval-workspace">
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px;">
              <input id="financeSearch" type="search" placeholder="Search client or account…" style="flex:1;min-width:200px;max-width:340px;" />
              <button class="secondary-btn" type="button" id="financeAddBtn">+ Add record</button>
              <button class="secondary-btn" type="button" id="financeImportBtn">Import CSV</button>
              <button class="secondary-btn" type="button" id="financeExportBtn">Export CSV</button>
            </div>
            <div id="financeImportPanel" class="panel" style="display:none;margin-bottom:18px;">
              <h3>Import CSV</h3>
              <p style="font-size:13px;color:var(--muted);margin-bottom:10px;">Columns: <strong>client_name, account_number, current, days_30, days_60, days_90, days_120_plus, notes, last_updated</strong></p>
              <label>Select CSV file<input id="financeCsvFile" type="file" accept=".csv" /></label>
              <div style="display:flex;gap:8px;margin-top:10px;">
                <button class="primary-btn" type="button" id="financeCsvImportSubmit">Import</button>
                <button class="secondary-btn" type="button" id="financeCsvImportCancel">Cancel</button>
              </div>
              <p id="financeCsvStatus" style="margin-top:8px;font-size:13px;"></p>
            </div>
            <div id="financeFormPanel" class="panel" style="display:none;margin-bottom:18px;">
              <h3 id="financeFormTitle">Add Balance Record</h3>
              <form class="setup-form" id="financeForm" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">
                <input id="financeRecordId" type="hidden" />
                <label style="grid-column:1/-1;">Client name<input id="financeClientName" type="text" placeholder="Client name" required /></label>
                <label>Account number<input id="financeAccountNumber" type="text" placeholder="ACC-001" /></label>
                <label>Last updated<input id="financeLastUpdated" type="date" /></label>
                <label>Current (R)<input id="financeCurrent" type="number" min="0" step="0.01" value="0" /></label>
                <label>30 days (R)<input id="financeDays30" type="number" min="0" step="0.01" value="0" /></label>
                <label>60 days (R)<input id="financeDays60" type="number" min="0" step="0.01" value="0" /></label>
                <label>90 days (R)<input id="financeDays90" type="number" min="0" step="0.01" value="0" /></label>
                <label>120+ days (R)<input id="financeDays120" type="number" min="0" step="0.01" value="0" /></label>
                <label style="grid-column:1/-1;">Notes<input id="financeNotes" type="text" placeholder="Optional notes" /></label>
                <div style="grid-column:1/-1;display:flex;gap:8px;">
                  <button class="primary-btn" type="submit" id="financeFormSubmit">Save record</button>
                  <button class="secondary-btn" type="button" id="financeFormCancel">Cancel</button>
                </div>
              </form>
            </div>
            <div class="finance-table" id="financeTable">
              <div class="finance-table-row finance-table-head" style="display:grid;grid-template-columns:minmax(160px,2fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(100px,.8fr) minmax(80px,.6fr);">
                <span>Client</span><span>Account</span><span>Current</span><span>30 Days</span><span>60 Days</span><span>90 Days</span><span>120+ Days</span><span>Total</span><span>Actions</span>
              </div>
              <div id="financeTableBody"></div>
              <div id="financeTableEmpty" class="approval-table-empty" style="display:none;">No balance records found.</div>
              <div class="finance-table-row" id="financeTotalsRow" style="display:grid;grid-template-columns:minmax(160px,2fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(100px,.8fr) minmax(80px,.6fr);background:var(--surface);font-weight:700;border-top:2px solid var(--line);">
                <span><strong>TOTALS</strong></span><span></span>
                <span id="finTotalCurrent">R 0.00</span><span id="finTotal30">R 0.00</span>
                <span id="finTotal60">R 0.00</span><span id="finTotal90">R 0.00</span>
                <span id="finTotal120">R 0.00</span><span id="finTotalAll">R 0.00</span><span></span>
              </div>
            </div>
          </div>
        </section>
'''
    main_end = html.rfind('</main>')
    html = html[:main_end] + finance_section + html[main_end:]

with open('index.html', 'w') as f: f.write(html)
print('✓ index.html')

# ── 4. app.js ─────────────────────────────────────────────────────────────────
with open('app.js', 'r') as f: js = f.read()

if '"finance_age_analysis"' not in js:
    js = js.replace(
        '  { key: "sales_quotation_requests", label: "Sales Quotation Requests", section: "salesRequests" },\n];',
        '  { key: "sales_quotation_requests", label: "Sales Quotation Requests", section: "salesRequests" },\n  { key: "finance_age_analysis", label: "Finance Age Analysis", section: "finance" },\n];'
    )

if '"finance"' not in js or 'Age Analysis' not in js:
    js = js.replace(
        '  settings: {\n    eyebrow: "Platform setup",\n    title: "Setup",',
        '  finance: {\n    eyebrow: "Finance",\n    title: "Age Analysis",\n    status: "Finance",\n  },\n  settings: {\n    eyebrow: "Platform setup",\n    title: "Setup",'
    )

js = js.replace(
    '"salesRequests", "approvals", "library", "projectTimeline", "settings", "audit"].includes(targetSection)',
    '"salesRequests", "approvals", "library", "projectTimeline", "settings", "audit", "finance"].includes(targetSection)'
)

if 'loadFinanceBalances' not in js:
    js += r"""

// ── Finance Age Analysis ──────────────────────────────────────────────────────
const financeSearch=document.querySelector("#financeSearch");
const financeAddBtn=document.querySelector("#financeAddBtn");
const financeImportBtn=document.querySelector("#financeImportBtn");
const financeExportBtn=document.querySelector("#financeExportBtn");
const financeImportPanel=document.querySelector("#financeImportPanel");
const financeCsvFile=document.querySelector("#financeCsvFile");
const financeCsvImportSubmit=document.querySelector("#financeCsvImportSubmit");
const financeCsvImportCancel=document.querySelector("#financeCsvImportCancel");
const financeCsvStatus=document.querySelector("#financeCsvStatus");
const financeFormPanel=document.querySelector("#financeFormPanel");
const financeFormTitle=document.querySelector("#financeFormTitle");
const financeForm=document.querySelector("#financeForm");
const financeFormCancel=document.querySelector("#financeFormCancel");
const financeTableBody=document.querySelector("#financeTableBody");
const financeTableEmpty=document.querySelector("#financeTableEmpty");
const financeTotalsRow=document.querySelector("#financeTotalsRow");
let financeBalances=[];
const FIN_COLS="minmax(160px,2fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(100px,.8fr) minmax(80px,.6fr)";
function fmtR(v){return"R "+Number(v||0).toLocaleString("en-ZA",{minimumFractionDigits:2,maximumFractionDigits:2});}
async function loadFinanceBalances(){
  try{const res=await fetch("/api/finance/balances",{credentials:"include"});
  if(!res.ok)return;const data=await res.json();financeBalances=data.balances||[];renderFinanceTable();}
  catch(e){console.warn("[finance] load failed",e);}
}
function renderFinanceTable(){
  if(!financeTableBody)return;
  const q=(financeSearch?financeSearch.value:"").toLowerCase();
  const rows=financeBalances.filter((r)=>!q||r.client_name.toLowerCase().includes(q)||(r.account_number||"").toLowerCase().includes(q));
  if(rows.length===0){financeTableBody.innerHTML="";if(financeTableEmpty)financeTableEmpty.style.display="";if(financeTotalsRow)financeTotalsRow.style.display="none";return;}
  if(financeTableEmpty)financeTableEmpty.style.display="none";
  financeTableBody.innerHTML=rows.map((r)=>`<div class="finance-table-row" style="display:grid;grid-template-columns:${FIN_COLS};align-items:center;" data-id="${escapeHtml(r.id)}"><span><strong>${escapeHtml(r.client_name)}</strong>${r.notes?`<small style="display:block;color:var(--muted);font-size:11px;">${escapeHtml(r.notes)}</small>`:""}</span><span>${escapeHtml(r.account_number||"—")}</span><span>${fmtR(r.current)}</span><span>${fmtR(r.days_30)}</span><span>${fmtR(r.days_60)}</span><span>${fmtR(r.days_90)}</span><span style="color:${r.days_120_plus>0?"var(--red,#c0392b)":"inherit"};font-weight:${r.days_120_plus>0?"700":"400"};">${fmtR(r.days_120_plus)}</span><span><strong>${fmtR(r.total)}</strong></span><span style="display:flex;gap:6px;flex-wrap:wrap;"><button class="link-btn" style="font-size:12px;" onclick="financeEditRecord('${escapeHtml(r.id)}')">Edit</button><button class="link-btn" style="font-size:12px;color:var(--red,#c0392b);" onclick="financeDeleteRecord('${escapeHtml(r.id)}')">Delete</button></span></div>`).join("");
  const sum=(key)=>rows.reduce((a,r)=>a+Number(r[key]||0),0);
  document.querySelector("#finTotalCurrent").textContent=fmtR(sum("current"));
  document.querySelector("#finTotal30").textContent=fmtR(sum("days_30"));
  document.querySelector("#finTotal60").textContent=fmtR(sum("days_60"));
  document.querySelector("#finTotal90").textContent=fmtR(sum("days_90"));
  document.querySelector("#finTotal120").textContent=fmtR(sum("days_120_plus"));
  document.querySelector("#finTotalAll").textContent=fmtR(sum("total"));
  if(financeTotalsRow)financeTotalsRow.style.display="grid";
}
function financeShowForm(record){
  if(!financeFormPanel)return;
  financeFormPanel.style.display="";
  financeFormTitle.textContent=record?"Edit Balance Record":"Add Balance Record";
  document.querySelector("#financeRecordId").value=record?record.id:"";
  document.querySelector("#financeClientName").value=record?record.client_name:"";
  document.querySelector("#financeAccountNumber").value=record?(record.account_number||""):"";
  document.querySelector("#financeLastUpdated").value=record?(record.last_updated||new Date().toISOString().slice(0,10)):new Date().toISOString().slice(0,10);
  document.querySelector("#financeCurrent").value=record?(record.current??0):0;
  document.querySelector("#financeDays30").value=record?(record.days_30??0):0;
  document.querySelector("#financeDays60").value=record?(record.days_60??0):0;
  document.querySelector("#financeDays90").value=record?(record.days_90??0):0;
  document.querySelector("#financeDays120").value=record?(record.days_120_plus??0):0;
  document.querySelector("#financeNotes").value=record?(record.notes||""):"";
  financeFormPanel.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function financeHideForm(){if(financeFormPanel)financeFormPanel.style.display="none";if(financeForm)financeForm.reset();}
window.financeEditRecord=function(id){const r=financeBalances.find((b)=>b.id===id);if(r)financeShowForm(r);};
window.financeDeleteRecord=async function(id){
  const r=financeBalances.find((b)=>b.id===id);
  if(!r||!confirm('Delete balance record for "'+r.client_name+'"?'))return;
  try{const res=await fetch("/api/finance/balances?id="+encodeURIComponent(id),{method:"DELETE",credentials:"include"});
  if(!res.ok){const d=await res.json();alert(d.error||"Delete failed");return;}
  await loadFinanceBalances();}catch(e){alert("Network error");}
};
if(financeAddBtn)financeAddBtn.addEventListener("click",()=>financeShowForm(null));
if(financeFormCancel)financeFormCancel.addEventListener("click",financeHideForm);
if(financeSearch)financeSearch.addEventListener("input",renderFinanceTable);
if(financeForm)financeForm.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const btn=document.querySelector("#financeFormSubmit");
  if(btn){btn.disabled=true;btn.textContent="Saving…";}
  const payload={id:document.querySelector("#financeRecordId").value||undefined,
    client_name:document.querySelector("#financeClientName").value,
    account_number:document.querySelector("#financeAccountNumber").value,
    last_updated:document.querySelector("#financeLastUpdated").value,
    current:document.querySelector("#financeCurrent").value,
    days_30:document.querySelector("#financeDays30").value,
    days_60:document.querySelector("#financeDays60").value,
    days_90:document.querySelector("#financeDays90").value,
    days_120_plus:document.querySelector("#financeDays120").value,
    notes:document.querySelector("#financeNotes").value};
  try{const res=await fetch("/api/finance/balances",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await res.json();if(!res.ok){alert(data.error||"Save failed");return;}
  financeHideForm();await loadFinanceBalances();}
  catch(err){alert("Network error");}
  finally{if(btn){btn.disabled=false;btn.textContent="Save record";}}
});
if(financeImportBtn)financeImportBtn.addEventListener("click",()=>{if(financeImportPanel)financeImportPanel.style.display=financeImportPanel.style.display==="none"?"":"none";});
if(financeCsvImportCancel)financeCsvImportCancel.addEventListener("click",()=>{if(financeImportPanel)financeImportPanel.style.display="none";if(financeCsvStatus)financeCsvStatus.textContent="";});
if(financeCsvImportSubmit)financeCsvImportSubmit.addEventListener("click",async()=>{
  const file=financeCsvFile&&financeCsvFile.files&&financeCsvFile.files[0];
  if(!file){if(financeCsvStatus)financeCsvStatus.textContent="Please select a CSV file.";return;}
  const text=await file.text();const lines=text.trim().split("\n");
  if(lines.length<2){if(financeCsvStatus)financeCsvStatus.textContent="CSV appears empty.";return;}
  const headers=lines[0].split(",").map((h)=>h.trim().replace(/^"|"$/g,"").toLowerCase().replace(/\s+/g,"_"));
  const rows=lines.slice(1).filter(Boolean).map((line)=>{const vals=line.split(",").map((v)=>v.trim().replace(/^"|"$/g,""));return Object.fromEntries(headers.map((h,i)=>[h,vals[i]||""]));});
  if(financeCsvStatus)financeCsvStatus.textContent="Parsed "+rows.length+" rows. Uploading…";
  try{const res=await fetch("/api/finance/import",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({rows})});
  const data=await res.json();if(!res.ok){if(financeCsvStatus)financeCsvStatus.textContent=data.error||"Import failed";return;}
  if(financeCsvStatus)financeCsvStatus.textContent="✓ Imported "+data.imported+" records."+(data.errors&&data.errors.length?" Errors: "+data.errors.join("; "):"");
  if(financeCsvFile)financeCsvFile.value="";await loadFinanceBalances();}
  catch(err){if(financeCsvStatus)financeCsvStatus.textContent="Network error.";}
});
if(financeExportBtn)financeExportBtn.addEventListener("click",()=>{
  if(!financeBalances.length){alert("No records to export.");return;}
  const headers=["client_name","account_number","current","days_30","days_60","days_90","days_120_plus","total","notes","last_updated"];
  const csvRows=financeBalances.map((r)=>headers.map((h)=>'"'+String(r[h]!==undefined?r[h]:"").replace(/"/g,'""')+'"').join(","));
  const csv=[headers.join(",")].concat(csvRows).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="age-analysis-"+new Date().toISOString().slice(0,10)+".csv";a.click();
});
(function(){const section=document.querySelector("#finance-section");if(!section)return;
new MutationObserver(function(){if(!section.hidden)loadFinanceBalances();}).observe(section,{attributes:true,attributeFilter:["hidden"]});})();
"""

with open('app.js', 'w') as f: f.write(js)
print('✓ app.js')

# ── 5. Commit ─────────────────────────────────────────────────────────────────
subprocess.run(['git', 'add', 'server.js', 'index.html', 'app.js', 'styles.css'], check=True)
subprocess.run(['git', 'commit', '-m', 'feat: finance age analysis + scroll fix + auth fixes'], check=True)
subprocess.run(['git', 'push'], check=True)
print('\n✅ All done — Render will redeploy in ~60 seconds.')