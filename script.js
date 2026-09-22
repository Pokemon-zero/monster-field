const defaultState={
  money:1000,
  inventory:{
    potion:2,
    ball:3,
    herb:0
  },
  area:"푸른 숲",
  encounter:null,
  monsters:[],
  exploreCount:0,
  exploreDate:""
};

let state=
  JSON.parse(localStorage.getItem("monsterGame")||"null")
  ||defaultState;


/* 예전 저장 데이터와의 호환 */

if(!state.inventory){
  state.inventory={
    potion:2,
    ball:3,
    herb:0
  };
}

if(state.inventory.potion===undefined){
  state.inventory.potion=2;
}

if(state.inventory.ball===undefined){
  state.inventory.ball=3;
}

if(state.inventory.herb===undefined){
  state.inventory.herb=0;
}

if(!state.area){
  state.area="푸른 숲";
}

if(!Array.isArray(state.monsters)){
  state.monsters=[];
}

if(state.encounter===undefined){
  state.encounter=null;
}

if(state.exploreCount===undefined){
  state.exploreCount=0;
}

if(state.exploreDate===undefined){
  state.exploreDate="";
}


/* 멤버 */

const members=[
  {
    id:1,
    name:"풀잎",
    role:"초보 트레이너",
    desc:"가자 포켓몬 마스터!"
  },
  {
    id:2,
    name:"초코",
    role:"초보 트레이너",
    desc:"용돈 부모님한테 받으면 안돼?"
  },
  {
    id:3,
    name:"미르",
    role:"초보 트레이너",
    desc:"드래곤 타입 전문가가 목표입니다."
  },
  {
    id:4,
    name:"보석",
    role:"초보 트레이너",
    desc:"내가 잘해야..."
  }
];


/* 아이템 */

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
    desc:"야생 포켓몬을 포획할 때 사용한다."
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


/* 날짜 확인 */

function checkExploreDay(){

  const now=new Date();

  const today=
    now.getFullYear()+"-"+
    String(now.getMonth()+1).padStart(2,"0")+"-"+
    String(now.getDate()).padStart(2,"0");

  if(state.exploreDate!==today){

    state.exploreDate=today;
    state.exploreCount=0;

    localStorage.setItem(
      "monsterGame",
      JSON.stringify(state)
    );
  }

}


/* 저장 */

function save(){

  localStorage.setItem(
    "monsterGame",
    JSON.stringify(state)
  );

  render();

}


/* 돈 */

function money(){

  const element=
    document.getElementById("money");

  if(element){

    element.textContent=
      state.money.toLocaleString();

  }

}


/* 알림 */

function toast(t){

  const element=
    document.getElementById("toast");

  if(!element){
    return;
  }

  element.textContent=t;

  element.classList.add("show");

  setTimeout(()=>{
    element.classList.remove("show");
  },1800);

}


/* 페이지 이동 */

function go(page){

  document.querySelectorAll(".page")
    .forEach(x=>{
      x.classList.remove("active");
    });

  const target=
    document.getElementById(page);

  if(target){
    target.classList.add("active");
  }

  document.querySelectorAll("nav button")
    .forEach(x=>{

      x.classList.toggle(
        "active",
        x.dataset.page===page
      );

    });

  render();

}


/* 클릭 처리 */

document.addEventListener("click",e=>{

  /* 페이지 이동 */

  const pageButton=
    e.target.closest("[data-page]");

  if(pageButton){

    go(pageButton.dataset.page);

    return;
  }


  /* 멤버 클릭 */

  const member=
    e.target.closest(".member");

  if(member){

    showProfile(
      Number(member.dataset.id)
    );

    return;
  }


  /* 포켓몬 클릭 */

  const monsterButton=
    e.target.closest("[data-monster-id]");

  if(monsterButton){

    showMonsterDetail(
      monsterButton.dataset.monsterId
    );

    return;
  }


  /* 지도 */

  const mapPoint=
    e.target.closest(".map-point");

  if(mapPoint){

    state.area=
      mapPoint.dataset.area;

    state.encounter=null;

    save();

    toast(
      state.area+"로 이동했습니다."
    );

    return;
  }


  /* 탐색 */

  if(e.target.id==="explore-btn"){

    explore();

    return;
  }


  /* 아이템 구매 */

  const buy=
    e.target.closest("[data-buy]");

  if(buy){

    buyItem(buy.dataset.buy);

    return;
  }


  /* 아이템 사용 */

  const use=
    e.target.closest("[data-use]");

  if(use){

    useItem(use.dataset.use);

    return;
  }


  /* 도망 */

  if(e.target.id==="run-away"){

    state.encounter=null;

    save();

    toast("무사히 도망쳤다.");

    return;
  }


  /* 포획 */

  if(e.target.id==="catch"){

    catchMonster();

    return;
  }

});


/* 멤버 상세 */

function showProfile(id){

  const member=
    members.find(x=>x.id===id);

  if(!member){
    return;
  }


  document.getElementById(
    "profile-content"
  ).innerHTML=`

    <div class="profile-card">

      <span class="tag">
        ${member.role}
      </span>

      <h1>
        ${member.name}
      </h1>

      <p>
        ${member.desc}
      </p>

    </div>

  `;

  go("profile");

}


/* 야생 포켓몬 생성 */

function createWildMonster(){

  const base=
    monsters[
      Math.floor(
        Math.random()*monsters.length
      )
    ];

  const level=
    Math.floor(
      Math.random()*
      (base.maxLevel-base.minLevel+1)
    )
    +base.minLevel;

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

  checkExploreDay();

  if(state.exploreCount>=10){

    toast(
      "오늘은 더 이상 탐색할 수 없습니다."
    );

    return;
  }


  state.exploreCount++;


  /*
    10% 확률:
    포켓몬을 만나지 못하고 100G 획득
  */

  if(Math.random()<0.1){

    state.money+=100;

    state.encounter=null;

    save();

    toast(
      "포켓몬을 만나지 못했다. 100G를 획득했다!"
    );

    return;
  }


  /* 포켓몬을 만남 */

  state.encounter=
    createWildMonster();


  /*
    40% 확률:
    오랭열매도 같이 발견
  */

  if(Math.random()<0.4){

    state.inventory.herb++;

    save();

    toast(
      "야생 포켓몬이 나타났다! 오랭열매도 발견했다."
    );

    return;

  }


  save();

  toast(
    "야생 포켓몬이 나타났다!"
  );

}


/* 포획 */

function catchMonster(){

  if(!state.encounter){

    toast(
      "포획할 포켓몬이 없습니다."
    );

    return;
  }


  if(!state.inventory.ball){

    toast(
      "몬스터볼이 없습니다!"
    );

    return;
  }


  const wild=
    state.encounter;

  state.inventory.ball--;


  const success=
    Math.random()<wild.catchRate;


  if(success){

    const caught={

      id:
        Date.now()+Math.random(),

      name:
        wild.name,

      type:
        wild.type,

      level:
        wild.level,

      hp:
        wild.maxHp,

      maxHp:
        wild.maxHp

    };


    state.monsters.push(
      caught
    );

    state.encounter=null;

    save();

    toast(
      `${caught.name} Lv.${caught.level}을/를 잡았다!`
    );

  }else{

    state.encounter=null;

    save();

    toast(
      "앗! 포켓몬이 볼에서 나와 버렸다!"
    );

  }

}


/* 포켓몬 목록 */

function renderMonsters(){

  const list=
    document.getElementById(
      "monster-list"
    );

  if(!list){
    return;
  }


  if(!state.monsters.length){

    list.innerHTML=`

      <div class="empty-monsters">

        <div>🌱</div>

        <h3>
          아직 포획한 포켓몬이 없습니다.
        </h3>

        <p>
          지도에서 탐색하여 포켓몬을 만나보세요.
        </p>

        <button
          class="primary"
          data-page="map"
        >
          🗺️ 탐험하러 가기
        </button>

      </div>

    `;

    return;
  }


  list.innerHTML=
    state.monsters.map(m=>{

      const hpPercent=
        Math.max(
          0,
          Math.min(
            100,
            (m.hp/m.maxHp)*100
          )
        );


      return`

        <button
          class="monster-card"
          data-monster-id="${m.id}"
        >

          <div class="monster-info">

            <h3>
              ${m.name}
            </h3>

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

  const pokemon=
    state.monsters.find(
      x=>String(x.id)===String(id)
    );

  if(!pokemon){
    return;
  }


  document.getElementById(
    "monster-detail-content"
  ).innerHTML=`

    <div class="monster-detail-card">

      <span class="type-tag">
        ${pokemon.type} 타입
      </span>

      <h1>
        ${pokemon.name}
      </h1>

      <p>
        Lv.${pokemon.level}
      </p>


      <div class="detail-stats">

        <div class="detail-stat">

          <small>
            현재 HP
          </small>

          <b>
            ${pokemon.hp}
          </b>

        </div>


        <div class="detail-stat">

          <small>
            최대 HP
          </small>

          <b>
            ${pokemon.maxHp}
          </b>

        </div>

      </div>


      <div class="detail-stats">

        <div class="detail-stat">

          <small>
            기술
          </small>

          <b>
            아직 없음
          </b>

        </div>


        <div class="detail-stat">

          <small>
            상태
          </small>

          <b>
            정상
          </b>

        </div>

      </div>

    </div>

  `;


  go("monster-detail");

}


/* 아이템 사용 */

function useItem(id){

  if(!state.inventory[id]){

    toast(
      "아이템이 없습니다."
    );

    return;
  }


  if(id==="potion"){

    /*
      현재는 포켓몬 선택 회복 시스템이
      아직 없으므로 수량만 감소
    */

    state.inventory.potion--;

    save();

    toast(
      "상처약을 사용했습니다!"
    );

    return;
  }


  toast(
    "이 아이템은 아직 사용할 곳이 없습니다."
  );

}


/* 상점 구매 */

function buyItem(id){

  const item=
    items[id];

  if(!item){
    return;
  }


  if(state.money<item.price){

    toast(
      "돈이 부족합니다."
    );

    return;
  }


  state.money-=item.price;

  state.inventory[id]++;

  save();

  toast(
    `${item.name}을 구매했습니다.`
  );

}


/* 멤버 목록 */

function renderMembers(){

  const list=
    document.getElementById(
      "member-list"
    );

  if(!list){
    return;
  }


  list.innerHTML=
    members.map(member=>`

      <button
        class="member"
        data-id="${member.id}"
      >

        <div class="portrait">
          👤
        </div>

        <div class="info">

          <h3>
            ${member.name}
          </h3>

          <p>
            ${member.role}
          </p>

        </div>

      </button>

    `).join("");

}


/* 가방 */

function renderBag(){

  const list=
    document.getElementById(
      "bag-list"
    );

  if(!list){
    return;
  }


  list.innerHTML=
    Object.entries(items)
      .map(([id,item])=>`

        <div class="item">

          <div class="item-icon">
            ${item.icon}
          </div>


          <div class="item-info">

            <b>
              ${item.name} ×
              ${state.inventory[id]||0}
            </b>

            <span>
              ${item.desc}
            </span>

          </div>


          <button
            class="use"
            data-use="${id}"
          >
            사용
          </button>

        </div>

      `)
      .join("");

}


/* 상점 */

function renderShop(){

  const specialName=
    document.getElementById(
      "special-name"
    );

  const specialPrice=
    document.getElementById(
      "special-price"
    );

  const shopList=
    document.getElementById(
      "shop-list"
    );


  if(
    !specialName ||
    !specialPrice ||
    !shopList
  ){
    return;
  }


  const day=
    new Date().getDate();


  const special=
    ["potion","ball","herb"][
      day%3
    ];


  const specialItem=
    items[special];


  specialName.textContent=
    specialItem.name;


  specialPrice.textContent=
    Math.floor(
      specialItem.price*.7
    ).toLocaleString()
    +" G";


  shopList.innerHTML=
    Object.entries(items)
      .map(([id,item])=>`

        <div class="shop-item">

          <div class="item-icon">
            ${item.icon}
          </div>


          <div class="item-info">

            <b>
              ${item.name}
            </b>

            <span>
              ${item.price.toLocaleString()}
              G · ${item.desc}
            </span>

          </div>


          <button
            class="buy"
            data-buy="${id}"
          >
            구매
          </button>

        </div>

      `)
      .join("");

}


/* 지도 */

function renderMap(){

  const area=
    document.getElementById(
      "current-area"
    );

  const exploreCount=
    document.getElementById(
      "explore-count"
    );

  const encounter=
    document.getElementById(
      "encounter"
    );


  checkExploreDay();


  if(!area || !encounter){
    return;
  }


  area.textContent=
    state.area;


  /* 탐색 횟수 표시 */

  if(exploreCount){

    exploreCount.textContent=
      `오늘의 탐색 ${state.exploreCount} / 10회`;

  }


  if(!state.encounter){

    encounter.innerHTML="";

    return;
  }


  const pokemon=
    state.encounter;


  encounter.innerHTML=`

    <div class="encounter-card">

      <h3>
        야생의
        ${pokemon.name}
        Lv.${pokemon.level}
        이(가) 나타났다!
      </h3>

      <p>
        ${pokemon.type} 타입
        · HP ${pokemon.hp}/${pokemon.maxHp}
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


/* 시작 */

render();
