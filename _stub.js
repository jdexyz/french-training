global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v}};
const el=new Proxy({},{get:()=>(()=>{})});
function mkEl(){return {style:{},classList:{add(){},remove(){}},appendChild(){},addEventListener(){},
  set innerHTML(v){}, set textContent(v){}, set className(v){}, set value(v){this._v=v}, get value(){return this._v||'google'},
  options:[], querySelector:()=>mkEl(), querySelectorAll:()=>[], onclick:null, focus(){}};}
global.document={getElementById:()=>mkEl(),querySelector:()=>mkEl(),querySelectorAll:()=>[],createElement:()=>mkEl(),addEventListener(){}};
global.window={scrollTo(){}};
global.speechSynthesis={getVoices:()=>[{name:'Google français',lang:'fr-FR'},{name:'Thomas Compact',lang:'fr-FR'}],cancel(){},speak(){},set onvoiceschanged(f){}};
global.SpeechSynthesisUtterance=function(t){this.text=t};
global.Audio=function(){return {play:()=>Promise.resolve(),pause(){},set src(v){this._s=v}}};
global.setTimeout=(f)=>0; global.clearTimeout=()=>{};
