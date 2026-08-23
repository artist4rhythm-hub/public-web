// 소식 로더 — 별도 프로젝트의 publicSite 컬렉션(공개 읽기)만 읽는다.
export async function loadNews(org, limitN, el){
  if(!el) return;
  if(!window.PUBLIC_FB){ el.innerHTML = '<p class="note">소식 준비 중입니다.</p>'; return; }
  try{
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, where } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const app = initializeApp(window.PUBLIC_FB, 'public');
    const db = getFirestore(app);
    const snap = await getDocs(query(collection(db,'publicSite'),
      where('org','==',org), where('published','==',true)));
    const esc = t => String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const items = snap.docs.map(d=>({id:d.id, ...d.data()}))
      .sort((a,b)=>(b.at?.seconds||0)-(a.at?.seconds||0)).slice(0, limitN||50);
    el.innerHTML = items.length ? items.map(p=>{
      const d = p.at?.seconds ? new Date(p.at.seconds*1000) : null;
      const ds = d ? `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.` : '';
      const ph = (typeof p.photo==='string' && p.photo.startsWith('data:image/')) ? p.photo : '';
      return `<div class="news-it"><div class="t">${esc(p.title||'')}</div>
        <div class="m">${ds}${p.category?' · '+esc(p.category):''}</div>
        ${ph?`<img src="${ph}" alt="" style="max-width:100%;border-radius:10px;margin-top:9px">`:''}
        ${p.body?`<div class="b">${esc(p.body)}</div>`:''}</div>`;
    }).join('') : '<p class="note">아직 올라온 소식이 없습니다.</p>';
  }catch(e){
    el.innerHTML = '<p class="note">소식을 불러오지 못했습니다.</p>';
  }
}
