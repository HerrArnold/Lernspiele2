/* Navigation bridge; does not change any exercise/answer or daily-task logic. */
(()=>{
 // Every original game uses this bridge, including directly opened game URLs.
 // Display the gate before fetching; a missing network check must not unlock a game.
 if(location.pathname.includes('/spiele/')){
  const shield=document.createElement('div');
  shield.id='safari-game-access-shield';shield.setAttribute('role','status');
  shield.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:22px;background:#162b26f7;color:#fff;font-family:system-ui,Arial,sans-serif;text-align:center';
  shield.innerHTML='<div style="max-width:520px"><h1 style="font-size:26px">🦩 LernSafari</h1><p id="safari-game-access-status">Die Freigabe für dieses Spiel wird geprüft …</p><a href="../index.html" style="display:inline-block;padding:12px 18px;background:#f8e3b1;border-radius:12px;color:#23352e;font-weight:750;text-decoration:none">Zurück zur LernSafari</a></div>';
  document.body.append(shield);
  const check=document.createElement('script');
  check.src='../assets/game-zugang.js';
  document.head.append(check);
 }
 if(window.parent===window)return;
 document.body.classList.add('legacy-embedded');
 document.addEventListener('click',e=>{
   const a=e.target.closest('a[href]');if(!a)return;
   const href=a.getAttribute('href')||'';
   if(href.startsWith('spiele/')){
     e.preventDefault();window.parent.postMessage({source:'LernSafariOriginal',action:'openGame',file:href.slice(7)},location.origin==='null'?'*':location.origin);
   }else if(a.closest('.safari-exit-bar')||href.startsWith('../index.html')){
     e.preventDefault();window.parent.postMessage({source:'LernSafariOriginal',action:'backToSubject'},location.origin==='null'?'*':location.origin);
   }
 },true);
})();
