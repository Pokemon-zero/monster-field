const defaultState={money:1000,inventory:{potion:2,ball:3,herb:0},area:"푸른 숲",encounter:null};
let state=JSON.parse(localStorage.getItem("monsterGame")||"null")||defaultState;
const members=[
 {id:1,name:"루나",role:"탐험가",emoji:"🧙‍♀️",desc:"호기심 많은 숲의 탐험가",hp:92,atk:71},
 {id:2,name:"카일",role:"수호자",emoji:"🛡️",desc:"마을을 지키는 든든한 수호자",hp:100,atk:65},
 {id:3,name:"미라",role:"연구자",emoji:"🔮",desc:"몬스터 생태를 연구한다",hp:78,atk:58},
 {id:4,name:"레오",role:"사냥꾼",emoji:"🏹",desc:"흔적을 찾는 데 능하다",hp:85,atk:88}
];
const items={
 potion:{name:"회복 포션",icon:"🧪",price:100,desc:"HP를 조금 회복한다."},
 ball:{name:"몬스터볼",icon:"🔴",price:250,desc:"몬스터를 잡을 때 사용한다."},
 herb:{name:"신비한 허브",icon:"🌿",price:180,desc:"탐험 중 발견한 귀한 허브."}
};
const monsters=[
 {name:"슬라임",emoji:"🟢",reward:80},
 {name:"버섯몬",emoji:"🍄",reward:110},
 {name:"여우령",emoji:"🦊",reward:140},
 {name:"돌멩이",emoji:"🪨",reward:60},
 {name:"미니 드래곤",emoji:"🐉",reward:250}
];
function save(){localStorage.setItem("monsterGame",JSON.stringify(state));render();}
function money(){document.getElementById("money").textContent=state.money.toLocaleString();}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function go(page){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(page).classList.add("active");document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===page));render()}
document.addEventListener("click",e=>{
 const p=e.target.closest("[data-page]"); if(p){go(p.dataset.page);return}
 const m=e.target.closest(".member"); if(m){showProfile(+m.dataset.id);return}
 const a=e.target.closest(".map-point"); if(a){state.area=a.dataset.area;save();toast(state.area+"로 이동했습니다.");return}
 if(e.target.id==="explore-btn") explore();
 const buy=e.target.closest("[data-buy]"); if(buy) buyItem(buy.dataset.buy);
 const use=e.target.closest("[data-use]"); if(use) useItem(use.dataset.use);
 if(e.target.id==="run-away"){state.encounter=null;save();toast("무사히 도망쳤습니다.");}
 if(e.target.id==="catch"){catchMonster();}
});
function showProfile(id){const m=members.find(x=>x.id===id);document.getElementById("profile-content").innerHTML=`
 <div class="profile-card"><div class="profile-avatar">${m.emoji}</div><span class="tag">${m.role}</span><h1>${m.name}</h1><p>${m.desc}</p>
 <div class="stats"><div class="stat"><small>HP</small><b>${m.hp}</b></div><div class="stat"><small>ATK</small><b>${m.atk}</b></div><div class="stat"><small>등급</small><b>A</b></div></div></div>`;
go("profile")}
function explore(){
 const mon=monsters[Math.floor(Math.random()*monsters.length)];
 state.encounter=mon; if(Math.random()<.4) state.inventory.herb++;
 save(); toast("무언가 나타났습니다!");
}
function catchMonster(){
 if(!state.inventory.ball){toast("몬스터볼이 없습니다!");return}
 state.inventory.ball--;state.money+=state.encounter.reward;const n=state.encounter.name;state.encounter=null;save();toast(`${n}과의 탐색 보상 +${state.encounter?.reward||0}G`);
}
function useItem(id){if(!state.inventory[id]){toast("아이템이 없습니다.");return} if(id==="potion"){state.inventory.potion--;save();toast("포션을 사용했습니다!")}else toast("이 아이템은 아직 사용할 곳이 없습니다.")}
function buyItem(id){const it=items[id];if(state.money<it.price){toast("돈이 부족합니다.");return}state.money-=it.price;state.inventory[id]++;save();toast(`${it.name}을 구매했습니다.`)}
function renderMembers(){document.getElementById("member-list").innerHTML=members.map(m=>`<button class="member" data-id="${m.id}"><div class="portrait">${m.emoji}</div><div class="info"><h3>${m.name}</h3><p>${m.role}</p></div></button>`).join("")}
function renderBag(){document.getElementById("bag-list").innerHTML=Object.entries(items).map(([id,it])=>`<div class="item"><div class="item-icon">${it.icon}</div><div class="item-info"><b>${it.name} × ${state.inventory[id]||0}</b><span>${it.desc}</span></div><button class="use" data-use="${id}">사용</button></div>`).join("")}
function renderShop(){
 const day=new Date().getDate(); const special=["potion","ball","herb"][day%3];const sp=items[special];
 document.getElementById("special-name").textContent=sp.name;document.getElementById("special-price").textContent=Math.floor(sp.price*.7).toLocaleString()+" G";
 document.getElementById("shop-list").innerHTML=Object.entries(items).map(([id,it])=>`<div class="shop-item"><div class="item-icon">${it.icon}</div><div class="item-info"><b>${it.name}</b><span>${it.price.toLocaleString()} G · ${it.desc}</span></div><button class="buy" data-buy="${id}">구매</button></div>`).join("")
}
function renderMap(){
 document.getElementById("current-area").textContent=state.area;
 const e=document.getElementById("encounter");
 if(!state.encounter){e.innerHTML="";return}
 const m=state.encounter;e.innerHTML=`<div class="encounter-card"><div class="monster">${m.emoji}</div><h3>야생의 ${m.name}이(가) 나타났다!</h3><p>탐색 보상 ${m.reward}G</p><div class="encounter-actions"><button id="catch">🔴 몬스터볼 사용</button><button id="run-away">🏃 도망가기</button></div></div>`;
}
function render(){money();renderMembers();renderBag();renderShop();renderMap()}
render();
