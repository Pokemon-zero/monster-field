const defaultState={
  money:1000,
  inventory:{
    potion:2,
    ball:3,
    herb:0
  },
  area:"푸른 숲",
  encounter:null,
  monsters:[]
};

let state=JSON.parse(localStorage.getItem("monsterGame")||"null")||defaultState;

/* 예전 저장 데이터와의 호환 */
if(!state.inventory) state.inventory={potion:2,ball:3,herb:0};
if(state.inventory.potion===undefined) state.inventory.potion=2;
if(state.inventory.ball===undefined) state.inventory.ball=3;
if(state.inventory.herb===undefined) state.inventory.herb=0;
if(!state.area) state.area="푸른 숲";
if(!Array.isArray(state.monsters)) state.monsters=[];
if(state.encounter===undefined) state.encounter=null;

const members=[
 {id:1,name:"풀잎",role:"초보 트레이너",desc:"가자 포켓몬 마스터!"},
 {id:2,name:"초코",role:"초보 트레이너",desc:"용돈 부모님한테 받으면 안돼?"},
 {id:3,name:"미르",role:"초보 트레이너",desc:"드래곤 타입 전문가가 목표입니다"
 {id:4,name:"보석",role:"초보 트레이너",desc:"내가 잘해야..."}
];

const items={
 potion:{
  name:"상처약",
  icon:"🧪",
  price:200,
  desc:"HP를 조금 회복한다."
 },
 ball:{
  name:"몬스터볼",
  icon:"🔴",
  price:100,
  desc:"야생 포켓몬를 포획할 때 사용한다."
 },
 herb:{
  name:"오랭열매",
  icon:"🌿",
  price:80,
  desc:"탐험 중 발견한 오랭열매."
 }
};

/* 야생 포켓몬 */
const monsters=[
 {
  name:"구구",
  type:"노말, 비행",
  minLevel:2,
  maxLevel:5,
  baseHp:30,
  catchRate:.75
 },
 {
  name:"꼬렛",
  type:"노말",
  minLevel:2,
  maxLevel:6,
  baseHp:35,
  catchRate:.65
 },
 {
  name:"꼬리선",
  type:"노말",
  minLevel:3,
  maxLevel:7,
  baseHp:32,
  catchRate:.55
 },
 {
  name:"피콘",
  type:"벌레",
  minLevel:1,
  maxLevel:5,
  baseHp:42,
  catchRate:.8
 },
 {
  name:"포챠냐",
  type:"악",
  minLevel:5,
  maxLevel:10,
  baseHp:45,
  catchRate:.3
 }
];

function save(){
  localStorage.setItem("monsterGame",JSON.stringify(state));
  render();
}

function money(){
  document.getElementById("money").textContent=
    state.money.toLocaleString();
}

function toast(t){
  const e=document.getElementById("toast");
  e.textContent=t;
  e.classList.add("show");

  setTimeout(()=>{
    e.classList.remove("show");
  },1800);
}

function go(page){
  document.querySelectorAll(".page")
    .forEach(x=>x.classList.remove("active"));

  const target=document.getElementById(page);
  if(target) target.classList.add("active");

  document.querySelectorAll("nav button")
    .forEach(x=>{
      x.classList.toggle(
        "active",
        x.dataset.page===page
      );
    });

  render();
}

document.addEventListener("click",e=>{

  const p=e.target.closest("[data-page]");
  if(p){
    go(p.dataset.page);
    return;
  }

  const m=e.target.closest(".member");
  if(m){
    showProfile(+m.dataset.id);
    return;
  }

  const monster=e.target.closest("[data-monster-id]");
  if(monster){
    showMonsterDetail(monster.dataset.monsterId);
    return;
  }

  const a=e.target.closest(".map-point");
  if(a){
    state.area=a.dataset.area;
    state.encounter=null;
    save();
    toast(state.area+"로 이동했습니다.");
    return;
  }

  if(e.target.id==="explore-btn"){
    explore();
    return;
  }

  const buy=e.target.closest("[data-buy]");
  if(buy){
    buyItem(buy.dataset.buy);
    return;
  }

  const use=e.target.closest("[data-use]");
  if(use){
    useItem(use.dataset.use);
    return;
  }

  if(e.target.id==="run-away"){
    state.encounter=null;
    save();
    toast("무사히 도망쳤다.");
    return;
  }

  if(e.target.id==="catch"){
    catchMonster();
    return;
  }
});


/* 멤버 */
function showProfile(id){

  const m=members.find(x=>x.id===id);
  if(!m) return;

  document.getElementById("profile-content").innerHTML=`
    <div class="profile-card">
      <div class="profile-avatar">${m.emoji}</div>

      <span class="tag">${m.role}</span>

      <h1>${m.name}</h1>

      <p>${m.desc}</p>

      <div class="stats">
        <div class="stat">
          <small>HP</small>
          <b>${m.hp}</b>
        </div>

        <div class="stat">
          <small>ATK</small>
          <b>${m.atk}</b>
        </div>

        <div class="stat">
          <small>등급</small>
          <b>A</b>
        </div>
      </div>
    </div>
  `;

  go("profile");
}


/* 야생 포켓몬 생성 */
function createWildMonster(){

  const base=
    monsters[Math.floor(Math.random()*monsters.length)];

  const level=
    Math.floor(
      Math.random()*(base.maxLevel-base.minLevel+1)
    )+base.minLevel;

  const maxHp=
    base.baseHp+(level*3);

  return{
    ...base,
    level,
    maxHp,
    hp:maxHp
  };
}


/* 탐색 */
function explore(){

  // 10% 확률로 포켓몬을 만나지 못함
  if(Math.random()<0.1){

    state.money+=100;
    state.encounter=null;

    save();

    toast("포켓몬을 만나지 못했다. 100G를 획득했다!");

    return;
  }

  // 포켓몬을 만남
  state.encounter=createWildMonster();

  // 20% 확률로 오랭열매도 같이 발견
  if(Math.random()<0.4){

    state.inventory.herb++;

    toast("야생 포켓몬이 나타났다! 오랭열매도 발견했다.");

  }else{

    toast("야생 포켓몬이 나타났다!");

  }

  save();
}


/* 포획 */
function catchMonster(){

  if(!state.encounter){
    toast("포획할 포켓몬이 없습니다.");
    return;
  }

  if(!state.inventory.ball){
    toast("몬스터볼이 없습니다!");
    return;
  }

  const wild=state.encounter;

  state.inventory.ball--;

  const success=Math.random()<wild.catchRate;

  if(success){

    const caught={
      id:Date.now()+Math.random(),
      name:wild.name,
      emoji:wild.emoji,
      type:wild.type,
      level:wild.level,
      hp:wild.maxHp,
      maxHp:wild.maxHp
    };

    state.monsters.push(caught);
    state.encounter=null;

    save();

    toast(`${caught.name} Lv.${caught.level}을/를 잡았다!`);

  }else{

    state.encounter=null;

    save();

    toast(`앗! 포켓몬이 볼에서 나와 버렸다!`);
  }
}


/* 포켓몬 목록 */
function renderMonsters(){

  const list=document.getElementById("monster-list");

  if(!state.monsters.length){

    list.innerHTML=`
      <div class="empty-monsters">
        <div>🌱</div>
        <h3>아직 포획한 포켓몬이 없습니다.</h3>
        <p>지도에서 탐색하여 포켓몬을 만나보세요.</p>
        <button class="primary" data-page="map">
          🗺️ 탐험하러 가기
        </button>
      </div>
    `;

    return;
  }

  list.innerHTML=state.monsters.map(m=>{

    const hpPercent=
      Math.max(0,Math.min(100,(m.hp/m.maxHp)*100));

    return`
      <button class="monster-card" data-monster-id="${m.id}">

        <div class="monster-art">
          ${m.emoji}
        </div>

        <div class="monster-info">

          <h3>${m.name}</h3>

          <p>
            Lv.${m.level} · ${m.type} 타입
          </p>

          <p>
            HP ${m.hp} / ${m.maxHp}
          </p>

          <div class="hp-bar">
            <div
              class="hp-fill"
              style="width:${hpPercent}%"
            ></div>
          </div>

        </div>

      </button>
    `;

  }).join("");
}


/* 포켓몬 상세 */
function showMonsterDetail(id){

  const m=
    state.monsters.find(
      x=>String(x.id)===String(id)
    );

  if(!m) return;

  document.getElementById("monster-detail-content").innerHTML=`

    <div class="monster-detail-card">

      <div class="monster-detail-art">
        ${m.emoji}
      </div>

      <span class="type-tag">
        ${m.type} 타입
      </span>

      <h1>${m.name}</h1>

      <p>Lv.${m.level}</p>

      <div class="detail-stats">

        <div class="detail-stat">
          <small>현재 HP</small>
          <b>${m.hp}</b>
        </div>

        <div class="detail-stat">
          <small>최대 HP</small>
          <b>${m.maxHp}</b>
        </div>

      </div>

      <div class="detail-stats">

        <div class="detail-stat">
          <small>기술</small>
          <b>아직 없음</b>
        </div>

        <div class="detail-stat">
          <small>상태</small>
          <b>정상</b>
        </div>

      </div>

    </div>
  `;

  go("monster-detail");
}


/* 가방 */
function useItem(id){

  if(!state.inventory[id]){
    toast("아이템이 없습니다.");
    return;
  }

  if(id==="potion"){

    state.inventory.potion--;

    save();

    toast("포션을 사용했습니다!");

  }else{

    toast("이 아이템은 아직 사용할 곳이 없습니다.");

  }
}


/* 상점 */
function buyItem(id){

  const it=items[id];

  if(state.money<it.price){
    toast("돈이 부족합니다.");
    return;
  }

  state.money-=it.price;

  state.inventory[id]++;

  save();

  toast(`${it.name}을 구매했습니다.`);
}


/* 멤버 렌더링 */
function renderMembers(){

  document.getElementById("member-list").innerHTML=
    members.map(m=>`

      <button class="member" data-id="${m.id}">

        <div class="portrait">
          ${m.emoji}
        </div>

        <div class="info">
          <h3>${m.name}</h3>
          <p>${m.role}</p>
        </div>

      </button>

    `).join("");
}


/* 가방 렌더링 */
function renderBag(){

  document.getElementById("bag-list").innerHTML=
    Object.entries(items).map(([id,it])=>`

      <div class="item">

        <div class="item-icon">
          ${it.icon}
        </div>

        <div class="item-info">

          <b>
            ${it.name} × ${state.inventory[id]||0}
          </b>

          <span>${it.desc}</span>

        </div>

        <button
          class="use"
          data-use="${id}">
          사용
        </button>

      </div>

    `).join("");
}


/* 상점 렌더링 */
function renderShop(){

  const day=new Date().getDate();

  const special=
    ["potion","ball","herb"][day%3];

  const sp=items[special];

  document.getElementById("special-name").textContent=
    sp.name;

  document.getElementById("special-price").textContent=
    Math.floor(sp.price*.7).toLocaleString()+" G";

  document.getElementById("shop-list").innerHTML=
    Object.entries(items).map(([id,it])=>`

      <div class="shop-item">

        <div class="item-icon">
          ${it.icon}
        </div>

        <div class="item-info">

          <b>${it.name}</b>

          <span>
            ${it.price.toLocaleString()} G · ${it.desc}
          </span>

        </div>

        <button
          class="buy"
          data-buy="${id}">
          구매
        </button>

      </div>

    `).join("");
}


/* 지도 */
function renderMap(){

  document.getElementById("current-area").textContent=
    state.area;

  const e=document.getElementById("encounter");

  if(!state.encounter){
    e.innerHTML="";
    return;
  }

  const m=state.encounter;

  e.innerHTML=`

    <div class="encounter-card">

      <div class="monster">
        ${m.emoji}
      </div>

      <h3>
        야생의 ${m.name} Lv.${m.level}이(가) 나타났다!
      </h3>

      <p>
        ${m.type} 타입 · HP ${m.hp}/${m.maxHp}
      </p>

      <div class="encounter-actions">

        <button id="catch">
          🔴 몬스터볼 사용
        </button>

        <button id="run-away">
          🏃 도망가기
        </button>

      </div>

    </div>
  `;
}


/* 전체 렌더링 */
function render(){

  money();
  renderMembers();
  renderMonsters();
  renderBag();
  renderShop();
  renderMap();
}

render();
