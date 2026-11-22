(function(){
const R=document.body.dataset.r||'';
const CAT=window.POSY_CAT||{};
const DEAL_MIN=2, DEAL_PCT=10;
const KEY='posy-cart-v1';
let mem=[];
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return mem}}
function save(c){mem=c;try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}}
const money=n=>'$'+n.toFixed(2);
function count(c){return c.reduce((a,l)=>a+l.qty,0)}
function totals(c){const sub=c.reduce((a,l)=>a+(CAT[l.slug]?CAT[l.slug].price*l.qty:0),0);const n=count(c);const disc=n>=DEAL_MIN?Math.round(sub*DEAL_PCT)/100:0;return{sub,disc,total:sub-disc,n}}
window.PosyCart={load,save,totals,money,CAT,R,DEAL_MIN,DEAL_PCT,add,open};

function add(slug,qty,note){qty=qty||1;const c=load();const l=c.find(x=>x.slug===slug&&(x.note||'')===(note||''));if(l)l.qty+=qty;else c.push({slug,qty,note:note||''});save(c);render();badge();toast((CAT[slug]?CAT[slug].name:'Item')+' added to your cart');open()}

// build drawer
const scrim=document.createElement('div');scrim.className='scrim';
const dr=document.createElement('aside');dr.className='drawer';dr.setAttribute('aria-label','Shopping cart');dr.setAttribute('role','dialog');dr.setAttribute('aria-modal','true');
dr.innerHTML='<header><h2>Your cart</h2><button class="x" type="button" aria-label="Close cart">×</button></header><div class="dbody"></div><div class="dfoot"></div>';
const tst=document.createElement('div');tst.className='toast';tst.setAttribute('role','status');
document.body.append(scrim,dr,tst);
let lastFocus=null;
function open(){lastFocus=document.activeElement;render();scrim.classList.add('on');dr.classList.add('on');dr.querySelector('.x').focus()}
function close(){scrim.classList.remove('on');dr.classList.remove('on');if(lastFocus)lastFocus.focus()}
scrim.onclick=close;dr.querySelector('.x').onclick=close;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dr.classList.contains('on'))close()});
let tt;function toast(m){tst.textContent=m;tst.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>tst.classList.remove('on'),2200)}

function dealText(n){if(n===0)return'Add any 2 items and get <b>10% off your whole order</b>.';if(n<DEAL_MIN)return'Add <b>1 more item</b> and get <b>10% off your whole order</b>.';return'<b>Bundle deal unlocked:</b> 10% off your whole order.'}
function render(){const c=load();const b=dr.querySelector('.dbody'),f=dr.querySelector('.dfoot');const t=totals(c);
 if(!c.length){b.innerHTML='<div class="empty-cart"><h3 class="h3">Your cart is empty</h3><p>Pick a bouquet or a few stems. Add any 2 items and you get 10% off.</p><a class="btn btn-primary" href="'+R+'shop.html">Browse the shop</a></div>';f.innerHTML='';f.hidden=true;return}
 f.hidden=false;
 const pct=Math.min(100,t.n/DEAL_MIN*100);
 let h='<div class="dealbar"><p>'+dealText(t.n)+'</p><div class="bar"><i style="width:'+pct+'%"></i></div></div>';
 c.forEach((l,i)=>{const p=CAT[l.slug];if(!p)return;h+='<div class="line"><img src="'+R+''+p.img+'.jpg" alt=""><div><b>'+p.name+'</b>'+(l.note?'<div class="sub">'+l.note+'</div>':'<div class="sub">'+money(p.price)+' each</div>')+'<div class="q"><button type="button" data-i="'+i+'" data-d="-1" aria-label="One less">−</button><span>'+l.qty+'</span><button type="button" data-i="'+i+'" data-d="1" aria-label="One more">+</button><button type="button" class="rm" data-rm="'+i+'">Remove</button></div></div><div class="lp">'+money(p.price*l.qty)+'</div></div>'});
 const inCart=new Set(c.map(l=>l.slug));const ups=['mini-love-trio','spring-mix-trio','red-rose','sunflower','classic-red-romance'].filter(s=>!inCart.has(s)&&CAT[s]).slice(0,2);
 if(ups.length)h+='<div class="upsell"><h3>'+(t.n<DEAL_MIN?'Add one to unlock 10% off':'Pairs well with')+'</h3>'+ups.map(s=>'<div class="u"><img src="'+R+''+CAT[s].img+'.jpg" alt=""><div><b>'+CAT[s].name+'</b><br>'+money(CAT[s].price)+'</div><button class="add" type="button" data-add="'+s+'">Add</button></div>').join('')+'</div>';
 b.innerHTML=h;
 f.innerHTML='<div class="sum"><div><span>Subtotal ('+t.n+' item'+(t.n>1?'s':'')+')</span><span>'+money(t.sub)+'</span></div>'+(t.disc?'<div class="save"><span>Bundle deal −10%</span><span>−'+money(t.disc)+'</span></div>':'')+'<div><span>Tracked shipping to the USA</span><span>Free</span></div><div class="tot"><span>Total</span><span>'+money(t.total)+'</span></div>'+(t.disc?'<div class="save"><span>You save</span><span>'+money(t.disc)+'</span></div>':'')+'</div><a class="btn btn-primary btn-block btn-lg" href="'+R+'checkout.html">Complete checkout</a><p class="small" style="text-align:center;margin-top:8px">Secure card payment on Shopier. The bundle deal is applied automatically there.</p>';
}
dr.addEventListener('click',e=>{const q=e.target.closest('[data-d]');const rm=e.target.closest('[data-rm]');const c=load();
 if(q){const l=c[+q.dataset.i];l.qty+= +q.dataset.d;if(l.qty<1)c.splice(+q.dataset.i,1);save(c);render();badge()}
 if(rm){c.splice(+rm.dataset.rm,1);save(c);render();badge()}});
function badge(){const n=count(load());document.querySelectorAll('.cartbtn .ct').forEach(x=>x.textContent=n)}
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(a){e.preventDefault();const qo=a.dataset.qtyFrom?document.querySelector(a.dataset.qtyFrom):null;add(a.dataset.add,qo?parseInt(qo.textContent)||1:1)}
 if(e.target.closest('.cartbtn')){e.preventDefault();open()}});
const mb=document.querySelector('.menu');if(mb)mb.onclick=()=>{const n=document.querySelector('.nav nav');const o=n.classList.toggle('open');mb.setAttribute('aria-expanded',o)};
window.addEventListener('storage',()=>{badge();render()});
badge();
})();
