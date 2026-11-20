const $ = id => document.getElementById(id);
const data = {
  hiragana: {
    title:"Vokal dasar", intro:"Lima karakter pertama dalam hiragana. Baca dari kiri ke kanan.",
    groups:[{label:"あ行 • Vokal",items:[["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"]]}],
    note:"Tips: あ (a), い (i), う (u), え (e), お (o). Bentuk huruf dan bunyinya perlu diingat bersama.",
    questions:[["あ","a",["a","i","u","e"]],["い","i",["o","i","a","e"]],["う","u",["u","a","e","o"]],["え","e",["i","e","o","u"]],["お","o",["a","o","u","i"]]]
  },
  katakana: {
    title:"Vokal katakana", intro:"Katakana sering digunakan untuk kata serapan dan nama asing.",
    groups:[{label:"ア行 • Vokal",items:[["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"]]}],
    note:"Katakana dan hiragana mewakili bunyi yang sama. Contoh: あ = ア = a.",
    questions:[["ア","a",["a","i","u","e"]],["イ","i",["o","i","a","e"]],["ウ","u",["u","a","e","o"]],["エ","e",["i","e","o","u"]],["オ","o",["a","o","u","i"]]]
  },
  vocab: {
    title:"Salam dan kata dasar", intro:"Kosakata sederhana yang sering kamu temui di awal belajar.",
    groups:[{label:"Kosakata N5",items:[["水","みず • air"],["本","ほん • buku"],["猫","ねこ • kucing"],["学生","がくせい • pelajar"],["学校","がっこう • sekolah"]]}],
    note:"Kata sulit? Tekan ikon 🔖 pada kata untuk memasukkannya ke Catatan Sulit dan mengulanginya nanti.",
    questions:[["水","air",["air","api","buku","kucing"]],["本","buku",["sekolah","buku","air","pelajar"]],["猫","kucing",["kucing","anjing","ikan","burung"]],["学生","pelajar",["guru","pelajar","dokter","teman"]],["学校","sekolah",["rumah","toko","sekolah","stasiun"]]]
  },
  kanji: {
    title:"Kanji pertama", intro:"Mulai kenali bentuk, arti, dan bacaan kanji dasar.",
    groups:[{label:"Kanji dasar",items:[["日","にち / ひ • hari, matahari"],["月","げつ / つき • bulan"],["人","じん / ひと • orang"],["山","さん / やま • gunung"],["川","せん / かわ • sungai"]]}],
    note:"Kanji dapat memiliki beberapa bacaan. Bacaan berubah sesuai kata dan konteks, jadi pelajari lewat contoh kosakata.",
    questions:[["日","hari / matahari",["hari / matahari","bulan","orang","gunung"]],["月","bulan",["sungai","bulan","api","air"]],["人","orang",["orang","gunung","buku","hari"]],["山","gunung",["sungai","bulan","gunung","sekolah"]],["川","sungai",["air","sungai","orang","gunung"]]]
  },
  grammar: {
    title:"です dan ですか", intro:"Dua pola sopan yang sangat penting untuk kalimat dasar.",
    groups:[{label:"Pola kalimat",items:[["です","desu • penutup pernyataan sopan"],["ですか","desu ka • penanda pertanyaan sopan"],["は","wa • penanda topik"],["の","no • kepemilikan/penghubung"],["か","ka • penanda pertanyaan"]]}],
    note:"Contoh: わたしは がくせいです。 (Saya pelajar.) / がくせいですか。 (Apakah [kamu] pelajar?) は ditulis ha tetapi dibaca wa saat menjadi partikel topik.",
    questions:[["です","penutup pernyataan sopan",["penutup pernyataan sopan","penanda objek","kepemilikan","penanda lokasi"]],["ですか","pertanyaan sopan",["penanda topik","pertanyaan sopan","penanda objek","kata kerja lampau"]],["は","penanda topik",["penanda objek","penanda topik","kepemilikan","penanda arah"]],["の","kepemilikan/penghubung",["kepemilikan/penghubung","pertanyaan","penanda objek","penanda waktu"]],["か","penanda pertanyaan",["penanda topik","penanda objek","penanda pertanyaan","penanda kepemilikan"]]]
  }
};

let profile = null, course = "hiragana", questionIndex = 0, selected = null, quizCorrect = 0, quizQuestions = [], quizCourse = "hiragana";
const courseNames = {hiragana:"HIRAGANA",katakana:"KATAKANA",vocab:"KOSAKATA",kanji:"KANJI",grammar:"TATA BAHASA"};
function levelFor(xp){ return Math.floor(xp/100)+1; }
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2100);}
function api(path,options={}){return fetch(path,{headers:{"Content-Type":"application/json"},...options}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Terjadi kesalahan");return d;});}
async function save(){
  if(!profile)return;
  try{
    const result=await api("/api/progress",{method:"POST",body:JSON.stringify({username:profile.username,xp:profile.xp,completed:profile.completed,difficult:profile.difficult,answers:profile.answers,correct:profile.correct})});
    profile=result.profile;renderStats();
  }catch(e){showToast("Progres belum tersimpan: "+e.message);}
}
function renderStats(){
  $("xp").textContent=profile.xp;$("level").textContent="Lv. "+levelFor(profile.xp);$("playerName").textContent=profile.username.toUpperCase();
  const done=profile.completed.length;const total=Object.keys(data).length;
  $("progressPercent").textContent=Math.round(done/total*100)+"%";$("progressBar").style.width=(done/total*100)+"%";$("completedCount").textContent=done+" dari "+total+" kategori selesai";
  $("nextLevel").textContent=(100-(profile.xp%100))+" XP ke level berikutnya";
  $("dailyXp").textContent=Math.min(profile.xp,30);$("dailyBar").style.width=Math.min(profile.xp/30*100,100)+"%";
  $("difficultList").innerHTML=profile.difficult.length?profile.difficult.map((w,i)=>`<div class="difficult-item"><span>${escapeHTML(w)}</span><button data-remove="${i}" aria-label="Hapus catatan">×</button></div>`).join(""):'<div class="empty-state">Belum ada. Tandai materi yang terasa sulit saat belajar.</div>';
  document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{profile.difficult.splice(Number(b.dataset.remove),1);save();}));
  document.querySelectorAll(".course-card").forEach(b=>b.classList.toggle("active",b.dataset.course===course));
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderLesson(){
  const d=data[course];$("lessonEyebrow").textContent=courseNames[course]+" • LEVEL 1";$("lessonTitle").textContent=d.title;$("lessonIntro").textContent=d.intro;
  $("lessonContent").innerHTML=d.groups.map(g=>`<p class="eyebrow">${g.label}</p><div class="char-row">${g.items.map(([c,m])=>`<div class="char-tile"><strong>${c}</strong><small>${m}</small><div><button class="mark-difficult" data-word="${escapeHTML(c+" · "+m)}" title="Tandai sulit" style="background:none;color:#c18b45;font-size:13px">🔖</button></div></div>`).join("")}</div>`).join("")+`<div class="lesson-note">${d.note}</div>`;
  document.querySelectorAll(".mark-difficult").forEach(b=>b.addEventListener("click",()=>{const w=b.dataset.word;if(!profile.difficult.includes(w)){profile.difficult.push(w);save();showToast("Ditambahkan ke Catatan Sulit 🔖");}else showToast("Sudah ada di Catatan Sulit.");}));
  $("prevBtn").disabled=course==="hiragana";
  $("startBtn").textContent=profile.completed.includes(course)?"Ulangi latihan →":"Mulai latihan →";
}
function startQuiz(){
  quizCourse=course;quizQuestions=data[course].questions;questionIndex=0;selected=null;quizCorrect=0;
  $("quizModal").classList.remove("hidden");renderQuestion();
}
function renderQuestion(){
  const q=quizQuestions[questionIndex];selected=null;
  $("quizCounter").textContent=`Pertanyaan ${questionIndex+1} dari ${quizQuestions.length}`;
  $("quizBar").style.width=(questionIndex/quizQuestions.length*100)+"%";
  $("questionArea").innerHTML=`<div class="question-char">${q[0]}</div><div class="choices">${q[2].map((choice,i)=>`<button class="choice" data-choice="${i}">${choice}</button>`).join("")}</div>`;
  $("answerFeedback").textContent="";$("answerFeedback").className="feedback";$("nextQuestion").disabled=true;$("nextQuestion").textContent="Periksa jawaban";
  document.querySelectorAll(".choice").forEach(b=>b.addEventListener("click",()=>{if(selected!==null)return;selected=Number(b.dataset.choice);b.classList.add("selected");$("nextQuestion").disabled=false;}));
}
function checkAnswer(){
  const q=quizQuestions[questionIndex],chosen= q[2][selected],correct=chosen===q[1];
  profile.answers=(profile.answers||0)+1;
  if(correct){quizCorrect++;profile.correct=(profile.correct||0)+1;}
  document.querySelectorAll(".choice").forEach(b=>{const v=q[2][Number(b.dataset.choice)];if(v===q[1])b.classList.add("correct");else if(Number(b.dataset.choice)===selected)b.classList.add("wrong");});
  $("answerFeedback").textContent=correct?"Benar! よくできました！ ✨":"Belum tepat. Jawaban: "+q[1];$("answerFeedback").className="feedback "+(correct?"good":"bad");
  $("nextQuestion").textContent=questionIndex===quizQuestions.length-1?"Selesaikan latihan":"Lanjut";
  $("nextQuestion").dataset.checked="true";
}
async function next(){
  if($("nextQuestion").dataset.checked!=="true"){checkAnswer();return;}
  delete $("nextQuestion").dataset.checked;
  questionIndex++;
  if(questionIndex<quizQuestions.length){renderQuestion();return;}
  const already=profile.completed.includes(quizCourse);
  const earned=quizCorrect*2+(already?0:10);
  profile.xp+=earned;
  if(!already)profile.completed.push(quizCourse);
  await save();$("quizBar").style.width="100%";
  $("questionArea").innerHTML=`<div class="question-char">🏆</div><h2 style="text-align:center">Latihan selesai!</h2><p style="text-align:center;color:#7c748e">Jawaban benar: ${quizCorrect}/${quizQuestions.length}</p><p style="text-align:center;color:#7658d8;font-weight:900">+${earned} XP</p>`;
  $("quizCounter").textContent="Misi selesai";$("answerFeedback").textContent="Simpan progresmu dan lanjutkan petualangan!";$("answerFeedback").className="feedback good";$("nextQuestion").textContent="Kembali ke beranda";$("nextQuestion").dataset.finish="true";
}
$("nextQuestion").addEventListener("click",()=>{if($("nextQuestion").dataset.finish==="true"){$("quizModal").classList.add("hidden");delete $("nextQuestion").dataset.finish;renderStats();renderLesson();}else next();});
$("closeQuiz").addEventListener("click",()=>$("quizModal").classList.add("hidden"));
document.querySelectorAll(".course-card").forEach(b=>b.addEventListener("click",()=>{course=b.dataset.course;renderStats();renderLesson();}));
$("startBtn").addEventListener("click",startQuiz);
$("prevBtn").addEventListener("click",()=>{course="hiragana";renderStats();renderLesson();});
$("reviewBtn").addEventListener("click",()=>{if(!profile.difficult.length){showToast("Belum ada materi sulit untuk diulang.");return;}showToast("Buka kategori terkait dan ulangi latihannya.");});
$("logoutBtn").addEventListener("click",()=>{localStorage.removeItem("nq_username");profile=null;$("app").classList.add("hidden");$("loginScreen").classList.remove("hidden");$("username").value="";});
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();$("loginError").textContent="";
  try{const result=await api("/api/login",{method:"POST",body:JSON.stringify({username:$("username").value})});profile=result.profile;localStorage.setItem("nq_username",profile.username);$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");renderStats();renderLesson();}
  catch(err){$("loginError").textContent=err.message;}
});
(async()=>{
  const remembered=localStorage.getItem("nq_username");
  if(remembered){try{const result=await api("/api/progress?username="+encodeURIComponent(remembered));profile=result.profile;$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");renderStats();renderLesson();}catch{localStorage.removeItem("nq_username");}}
})();
