const SUPABASE_URL =
  "https://zjaylououskihlejjasa.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_-a_siX-BtZ5auQudGrhkCA_nMG4MrhN";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================
   기본 상태
========================= */

const defaultState = {

  money: 1000,

  inventory: {
    potion: 2,
    ball: 3,
    herb: 0,
    rareCandy: 0
  },

  area: "푸른 숲",

  encounter: null,

  monsters: [],

  exploreCount: 0,

  exploreDate: ""

};


/* =========================
   로그인 상태
========================= */

let currentUser = null;

let currentTrainerNumber = null;


/* =========================
   포획 실패 확률
========================= */

const CATCH_FAIL_RATE = 0.2;


/* =========================
   저장 데이터 불러오기
========================= */

let state =
  JSON.parse(
    localStorage.getItem("monsterGame") || "null"
  ) || structuredClone(defaultState);


/* =========================
   예전 저장 데이터 정리
========================= */

if (!Array.isArray(state.monsters)) {
  state.monsters = [];
}


state.monsters.forEach(pokemon => {

  delete pokemon.hp;

  delete pokemon.maxHp;

});


/* =========================
   예전 저장 데이터와 호환
========================= */

if (!state.inventory) {

  state.inventory = {
    potion: 2,
    ball: 3,
    herb: 0,
    rareCandy: 0
  };

}


if (state.inventory.potion === undefined) {
  state.inventory.potion = 2;
}


if (state.inventory.ball === undefined) {
  state.inventory.ball = 3;
}


if (state.inventory.herb === undefined) {
  state.inventory.herb = 0;
}


if (state.inventory.rareCandy === undefined) {
  state.inventory.rareCandy = 0;
}


if (!state.area) {
  state.area = "푸른 숲";
}


if (!Array.isArray(state.monsters)) {
  state.monsters = [];
}


if (state.encounter === undefined) {
  state.encounter = null;
}


if (state.exploreCount === undefined) {
  state.exploreCount = 0;
}


if (state.exploreDate === undefined) {
  state.exploreDate = "";
}


/* =========================
   멤버
========================= */

const members = [

  {
    id: 1,
    trainerNumber: "000001",
    name: "풀잎",
    role: "초보 트레이너",
    desc: "가자 포켓몬 마스터!"
  },

  {
    id: 2,
    trainerNumber: "000002",
    name: "초코",
    role: "초보 트레이너",
    desc: "용돈 부모님한테 받으면 안돼?"
  },

  {
    id: 3,
    trainerNumber: "000003",
    name: "미르",
    role: "초보 트레이너",
    desc: "드래곤 타입 전문가가 목표입니다."
  },

  {
    id: 4,
    trainerNumber: "000004",
    name: "보석",
    role: "초보 트레이너",
    desc: "내가 잘해야..."
  }

];


/* =========================
   현재 로그인한 멤버
========================= */

function getCurrentMember() {

  if (!currentTrainerNumber) {
    return null;
  }

  return members.find(
    member =>
      String(member.trainerNumber) ===
      String(currentTrainerNumber)
  ) || null;

}


/* =========================
   트레이너 번호 → 내부 이메일
========================= */

function trainerNumberToEmail(
  trainerNumber
) {

  return (
    String(trainerNumber).trim() +
    "@pokemon-zero.local"
  );

}


/* =========================
   로그인 화면 표시
========================= */

function showLoginScreen() {

  document.body.classList.remove(
    "logged-in"
  );


  const trainerInput =
    document.getElementById(
      "trainer-number"
    );

  const passwordInput =
    document.getElementById(
      "login-password"
    );

  const message =
    document.getElementById(
      "login-message"
    );


  if (trainerInput) {
    trainerInput.value = "";
  }


  if (passwordInput) {
    passwordInput.value = "";
  }


  if (message) {
    message.textContent = "";
  }

}


/* =========================
   게임 화면 표시
========================= */

function showGameScreen() {

  document.body.classList.add(
    "logged-in"
  );


  render();

}


/* =========================
   로그인
========================= */

async function login() {

  const trainerInput =
    document.getElementById(
      "trainer-number"
    );

  const passwordInput =
    document.getElementById(
      "login-password"
    );

  const message =
    document.getElementById(
      "login-message"
    );

  const loginButton =
    document.getElementById(
      "login-btn"
    );


  if (
    !trainerInput ||
    !passwordInput
  ) {

    return;

  }


  const trainerNumber =
    trainerInput.value.trim();


  const password =
    passwordInput.value;


  if (!/^\d{6}$/.test(trainerNumber)) {

    if (message) {

      message.textContent =
        "트레이너 번호는 6자리 숫자입니다.";

    }

    return;

  }


  if (!password) {

    if (message) {

      message.textContent =
        "비밀번호를 입력해주세요.";

    }

    return;

  }


  if (loginButton) {

    loginButton.disabled = true;

    loginButton.textContent =
      "로그인 중...";

  }


  if (message) {
    message.textContent = "";
  }


const email =
  trainerNumberToEmail(
    trainerNumber
  );

const {
  data,
  error
} =
  await supabaseClient.auth.signInWithPassword({

    email: email,

    password: password

  });

  if (error) {

    console.error(
      "로그인 오류:",
      error
    );


    if (message) {

      message.textContent =
        "트레이너 번호 또는 비밀번호가 올바르지 않습니다.";

    }


    if (loginButton) {

      loginButton.disabled = false;

      loginButton.textContent =
        "로그인";

    }

    return;

  }


  currentUser =
    data.user;


  currentTrainerNumber =
    trainerNumber;


  showGameScreen();


  if (loginButton) {

    loginButton.disabled = false;

    loginButton.textContent =
      "로그인";

  }

}


/* =========================
   로그아웃
========================= */

async function logout() {

  await supabaseClient.auth.signOut();

  currentUser = null;

  currentTrainerNumber = null;

  showLoginScreen();

}


/* =========================
   로그인 상태 확인
========================= */

async function checkLogin() {

  const {
    data
  } =
    await supabaseClient.auth.getSession();


  const session =
    data.session;


  if (!session || !session.user) {

    currentUser = null;

    currentTrainerNumber = null;

    showLoginScreen();

    return;

  }


  currentUser =
    session.user;


  const email =
    currentUser.email || "";


  const trainerNumber =
    email.split("@")[0];


  if (
    /^\d{6}$/.test(trainerNumber)
  ) {

    currentTrainerNumber =
      trainerNumber;

  } else {

    currentTrainerNumber = null;

  }


  if (!currentTrainerNumber) {

    await supabaseClient.auth.signOut();

    showLoginScreen();

    return;

  }


  showGameScreen();

}


/* =========================
   로그인 버튼
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const loginButton =
      document.getElementById(
        "login-btn"
      );


    if (loginButton) {

      loginButton.addEventListener(
        "click",
        login
      );

    }


    const passwordInput =
      document.getElementById(
        "login-password"
      );


    if (passwordInput) {

      passwordInput.addEventListener(
        "keydown",
        e => {

          if (e.key === "Enter") {

            login();

          }

        }
      );

    }


    const trainerInput =
      document.getElementById(
        "trainer-number"
      );


    if (trainerInput) {

      trainerInput.addEventListener(
        "input",
        () => {

          trainerInput.value =
            trainerInput.value
              .replace(/\D/g, "")
              .slice(0, 6);

        }
      );

    }


    checkLogin();

  }
);


/* =========================
   Supabase 로그인 상태 변화
========================= */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (!session || !session.user) {

      currentUser = null;

      currentTrainerNumber = null;

      showLoginScreen();

      return;

    }


    currentUser =
      session.user;


    const email =
      currentUser.email || "";


    const trainerNumber =
      email.split("@")[0];


    if (
      /^\d{6}$/.test(trainerNumber)
    ) {

      currentTrainerNumber =
        trainerNumber;

    }


    showGameScreen();

  }
);


/* =========================
   기술 데이터
========================= */

const moveData = {

  꼬렛: [

    {
      name: "몸통박치기",
      learnLevel: 1,
      power: 35,
      accuracy: 95,
      pp: 35
    },

    {
      name: "꼬리흔들기",
      learnLevel: 1,
      power: null,
      accuracy: 100,
      pp: 30
    },

    {
      name: "전광석화",
      learnLevel: 7,
      power: 40,
      accuracy: 100,
      pp: 30
    }

  ]

};


/* =========================
   아이템
========================= */

const items = {

  potion: {

    name: "상처약",

    icon: "🧪",

    price: 200,

    desc:
      "포켓몬의 상태를 회복하는 아이템."

  },

  ball: {

    name: "몬스터볼",

    icon: "🔴",

    price: 100,

    desc:
      "야생 포켓몬을 포획할 때 사용한다."

  },

  herb: {

    name: "오랭열매",

    icon: "🌿",

    price: 80,

    desc:
      "탐험 중 발견한 오랭열매."

  },

  rareCandy: {

    name: "이상한사탕",

    icon: "🍬",

    price: 1000,

    desc:
      "포켓몬의 레벨을 1 올린다."

  }

};


/* =========================
   야생 포켓몬
========================= */

const monsters = [

  {
    name: "구구",
    type: "노말, 비행",
    minLevel: 2,
    maxLevel: 5
  },

  {
    name: "꼬렛",
    type: "노말",
    minLevel: 2,
    maxLevel: 6
  },

  {
    name: "꼬리선",
    type: "노말",
    minLevel: 3,
    maxLevel: 7
  },

  {
    name: "피콘",
    type: "벌레",
    minLevel: 1,
    maxLevel: 5
  },

  {
    name: "포챠냐",
    type: "악",
    minLevel: 5,
    maxLevel: 10
  }

];


/* =========================
   날짜 확인
========================= */

function checkExploreDay() {

  const now =
    new Date();


  const today =
    now.getFullYear() +
    "-" +
    String(
      now.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      now.getDate()
    ).padStart(2, "0");


  if (
    state.exploreDate !== today
  ) {

    state.exploreDate =
      today;

    state.exploreCount =
      0;


    localStorage.setItem(
      "monsterGame",
      JSON.stringify(state)
    );

  }

}


/* =========================
   저장
========================= */

function save() {

  localStorage.setItem(
    "monsterGame",
    JSON.stringify(state)
  );


  render();

}


/* =========================
   돈 표시
========================= */

function money() {

  const element =
    document.getElementById(
      "money"
    );


  if (element) {

    element.textContent =
      state.money.toLocaleString();

  }

}


/* =========================
   알림
========================= */

function toast(t) {

  const element =
    document.getElementById(
      "toast"
    );


  if (!element) {
    return;
  }


  element.textContent =
    t;


  element.classList.add(
    "show"
  );


  setTimeout(
    () => {

      element.classList.remove(
        "show"
      );

    },
    1800
  );

}


/* =========================
   페이지 이동
========================= */

function go(page) {

  document
    .querySelectorAll(".page")
    .forEach(x => {

      x.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      page
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll("nav button")
    .forEach(x => {

      x.classList.toggle(
        "active",
        x.dataset.page === page
      );

    });


  render();

}


/* =========================
   클릭 처리
========================= */

document.addEventListener(
  "click",
  e => {


    /* =========================
       모달 안쪽 클릭
    ========================= */

    if (
      e.target.closest(
        ".move-selector"
      )
    ) {

      return;

    }


    /* =========================
       기술 슬롯 클릭
    ========================= */

    const moveSlot =
      e.target.closest(
        ".move-slot"
      );


    if (moveSlot) {

      e.stopPropagation();


      const monsterCard =
        moveSlot.closest(
          "[data-monster-id]"
        );


      if (monsterCard) {

        showMoveSelector(

          monsterCard.dataset.monsterId,

          Number(
            moveSlot.dataset.moveIndex
          )

        );

      }


      return;

    }


    /* =========================
       페이지 이동
    ========================= */

    const pageButton =
      e.target.closest(
        "[data-page]"
      );


    if (pageButton) {

      go(
        pageButton.dataset.page
      );

      return;

    }


    /* =========================
       멤버 클릭
    ========================= */

    const member =
      e.target.closest(
        ".member"
      );


    if (member) {

      showProfile(
        Number(
          member.dataset.id
        )
      );

      return;

    }


    /* =========================
       포켓몬 클릭
    ========================= */

    const monsterButton =
      e.target.closest(
        "[data-monster-id]"
      );


    if (
      monsterButton &&
      !e.target.closest(
        ".move-slot"
      )
    ) {

      showMonsterDetail(
        monsterButton.dataset.monsterId
      );

      return;

    }


    /* =========================
       지도
    ========================= */

    const mapPoint =
      e.target.closest(
        ".map-point"
      );


    if (mapPoint) {

      state.area =
        mapPoint.dataset.area;


      state.encounter =
        null;


      save();


      toast(
        state.area +
        "로 이동했습니다."
      );


      return;

    }


    /* =========================
       탐색
    ========================= */

    if (
      e.target.id ===
      "explore-btn"
    ) {

      explore();

      return;

    }


    /* =========================
       아이템 구매
    ========================= */

    const buy =
      e.target.closest(
        "[data-buy]"
      );


    if (buy) {

      buyItem(
        buy.dataset.buy
      );

      return;

    }


    /* =========================
       아이템 사용
    ========================= */

    const use =
      e.target.closest(
        "[data-use]"
      );


    if (use) {

      useItem(
        use.dataset.use
      );

      return;

    }


    /* =========================
       도망
    ========================= */

    if (
      e.target.id ===
      "run-away"
    ) {

      state.encounter =
        null;


      save();


      toast(
        "무사히 도망쳤다."
      );


      return;

    }


    /* =========================
       포획
    ========================= */

    if (
      e.target.id ===
      "catch"
    ) {

      catchMonster();

      return;

    }


    /* =========================
       빈 기술 슬롯
    ========================= */

    const emptyMove =
      e.target.closest(
        ".move-slot.empty"
      );


    if (emptyMove) {

      e.stopPropagation();

      return;

    }

  }
);


/* =========================
   멤버 상세
========================= */

function showProfile(id) {

  const member =
    members.find(
      x =>
        x.id === id
    );


  if (!member) {
    return;
  }


  const isMyProfile =
    String(
      member.trainerNumber
    ) ===
    String(
      currentTrainerNumber
    );


  const profileType =
    isMyProfile
      ? "내 프로필"
      : "다른 사람 프로필";


  document.getElementById(
    "profile-content"
  ).innerHTML = `

    <div class="profile-card">

      <span class="tag">
        ${profileType}
      </span>

      <span class="tag">
        ${member.role}
      </span>

      <h1>
        ${member.name}
      </h1>

      <p>
        ${member.desc}
      </p>

      <small>
        트레이너 번호
        ${member.trainerNumber}
      </small>

    </div>

  `;


  go("profile");

}


/* =========================
   포켓몬이 배울 수 있는 기술
========================= */

function getLearnableMoves(
  pokemon
) {

  const data =
    moveData[pokemon.name] ||
    [];


  return data.filter(
    move =>
      move.learnLevel <=
      pokemon.level
  );

}


/* =========================
   기술 객체 만들기
========================= */

function createMove(
  move
) {

  return {

    name:
      move.name,

    learnLevel:
      move.learnLevel,

    power:
      move.power,

    accuracy:
      move.accuracy,

    pp:
      move.pp

  };

}


/* =========================
   레벨에 맞는 기술 자동 습득
========================= */

function giveInitialMoves(
  pokemon
) {

  const learnable =
    getLearnableMoves(
      pokemon
    );


  if (
    !Array.isArray(
      pokemon.moves
    )
  ) {

    pokemon.moves = [];

  }


  learnable.forEach(
    move => {

      if (
        pokemon.moves.length >= 4
      ) {

        return;

      }


      const alreadyHas =
        pokemon.moves.some(
          x =>
            x.name ===
            move.name
        );


      if (!alreadyHas) {

        pokemon.moves.push(
          createMove(move)
        );

      }

    }
  );

}


/* =========================
   야생 포켓몬 생성
========================= */

function createWildMonster() {

  const base =
    monsters[
      Math.floor(
        Math.random() *
        monsters.length
      )
    ];


  const level =
    Math.floor(
      Math.random() *
      (
        base.maxLevel -
        base.minLevel +
        1
      )
    ) +
    base.minLevel;


  return {

    ...base,

    level

  };

}


/* =========================
   탐색
========================= */

function explore() {

  checkExploreDay();


  if (
    state.exploreCount >= 10
  ) {

    toast(
      "오늘은 더 이상 탐색할 수 없습니다."
    );

    return;

  }


  state.exploreCount++;


  const exploreCount =
    document.getElementById(
      "explore-count"
    );


  if (exploreCount) {

    exploreCount.textContent =
      `오늘의 탐색 ${state.exploreCount} / 10회`;

  }


  /* =========================
     10% 확률
     포켓몬을 만나지 않음
  ========================= */

  if (
    Math.random() < 0.1
  ) {

    state.money += 100;

    state.encounter =
      null;


    save();


    toast(
      "포켓몬을 만나지 못했다. 100G를 획득했다!"
    );


    return;

  }


  /* =========================
     포켓몬 만남
  ========================= */

  state.encounter =
    createWildMonster();


  /* =========================
     40% 확률
     오랭열매 발견
  ========================= */

  if (
    Math.random() < 0.4
  ) {

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


/* =========================
   포획
========================= */

function catchMonster() {

  if (!state.encounter) {

    toast(
      "포획할 포켓몬이 없습니다."
    );

    return;

  }


  if (
    !state.inventory.ball
  ) {

    toast(
      "몬스터볼이 없습니다!"
    );

    return;

  }


  const wild =
    state.encounter;


  state.inventory.ball--;


  /* 20% 실패 / 80% 성공 */

  const success =
    Math.random() >=
    CATCH_FAIL_RATE;


  if (success) {

    const caught = {

      id:
        Date.now() +
        Math.random(),

      name:
        wild.name,

      type:
        wild.type,

      level:
        wild.level,

      item:
        null,

      moves:
        []

    };


    giveInitialMoves(
      caught
    );


    state.monsters.push(
      caught
    );


    state.encounter =
      null;


    save();


    toast(
      `${caught.name} Lv.${caught.level}을/를 잡았다!`
    );

  } else {

    state.encounter =
      null;


    save();


    toast(
      "앗! 포켓몬이 볼에서 나와 버렸다!"
    );

  }

}


/* =========================
   포켓몬 목록
========================= */

function renderMonsters() {

  const list =
    document.getElementById(
      "monster-list"
    );


  if (!list) {
    return;
  }


  if (
    !state.monsters.length
  ) {

    list.innerHTML = `

      <div class="empty-monsters">

        <div>
          🌱
        </div>

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


  list.innerHTML =
    state.monsters
      .map(m => {


        if (
          !Array.isArray(
            m.moves
          )
        ) {

          m.moves = [];

        }


        giveInitialMoves(m);


        const moves =
          m.moves || [];


        const slots =
          [0, 1, 2, 3]
            .map(i => {

              const move =
                moves[i];


              if (!move) {

                return `

                  <div
                    class="move-slot empty"
                    data-move-index="${i}"
                  >
                    기술 없음
                  </div>

                `;

              }


              return `

                <div
                  class="move-slot"
                  data-move-index="${i}"
                >
                  ${move.name}
                </div>

              `;

            })
            .join("");


        return `

          <div
            class="monster-card"
            data-monster-id="${m.id}"
          >

            <div class="monster-info">

              <h3>
                ${m.name}
              </h3>

              <p>
                Lv.${m.level}
                ·
                ${m.type} 타입
              </p>

              <div class="monster-moves">
                ${slots}
              </div>

            </div>

          </div>

        `;

      })
      .join("");


  localStorage.setItem(
    "monsterGame",
    JSON.stringify(state)
  );

}


/* =========================
   포켓몬 상세
========================= */

function showMonsterDetail(
  id
) {

  const pokemon =
    state.monsters.find(
      x =>
        String(x.id) ===
        String(id)
    );


  if (!pokemon) {
    return;
  }


  if (
    !Array.isArray(
      pokemon.moves
    )
  ) {

    pokemon.moves = [];

  }


  giveInitialMoves(
    pokemon
  );


  const moves =
    pokemon.moves;


  let moveHTML = "";


  if (!moves.length) {

    moveHTML = `

      <div class="detail-stat">

        <small>
          기술
        </small>

        <b>
          아직 없음
        </b>

      </div>

    `;

  } else {

    moveHTML =
      moves
        .map(
          (move, index) => `

            <div
              class="detail-stat"
              data-monster-id="${pokemon.id}"
            >

              <small>
                기술 ${index + 1}
              </small>

              <b>
                ${move.name}
              </b>

              <span>
                위력
                ${move.power === null
                  ? "-"
                  : move.power}
                ·
                명중
                ${move.accuracy}%
                ·
                PP
                ${move.pp}
              </span>

            </div>

          `
        )
        .join("");

  }


  document.getElementById(
    "monster-detail-content"
  ).innerHTML = `

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

        ${moveHTML}

      </div>

    </div>

  `;


  localStorage.setItem(
    "monsterGame",
    JSON.stringify(state)
  );


  go(
    "monster-detail"
  );

}


/* =========================
   기술 교체
========================= */

function showMoveSelector(
  monsterId,
  slotIndex
) {

  const pokemon =
    state.monsters.find(
      x =>
        String(x.id) ===
        String(monsterId)
    );


  if (!pokemon) {
    return;
  }


  if (
    !Array.isArray(
      pokemon.moves
    )
  ) {

    pokemon.moves = [];

  }


  const learnable =
    getLearnableMoves(
      pokemon
    );


  const currentMove =
    pokemon.moves[slotIndex];


  const available =
    learnable.filter(
      move => {

        const alreadyInOtherSlot =
          pokemon.moves.some(
            (learned, index) => {

              return (
                index !== slotIndex &&
                learned &&
                learned.name ===
                  move.name
              );

            }
          );


        return !alreadyInOtherSlot;

      }
    );


  if (!available.length) {

    toast(
      "현재 배울 수 있는 기술이 없습니다."
    );

    return;

  }


  const names =
    available
      .map(
        move => {

          const isCurrent =
            currentMove &&
            currentMove.name ===
              move.name;


          return `

            <button
              class="learn-move"
              data-monster-id="${pokemon.id}"
              data-slot-index="${slotIndex}"
              data-move-name="${move.name}"
            >

              <b>
                ${move.name}
                ${isCurrent ? " ✓" : ""}
              </b>

              <span>
                위력
                ${move.power === null
                  ? "-"
                  : move.power}
                ·
                명중
                ${move.accuracy}%
                ·
                PP
                ${move.pp}
              </span>

            </button>

          `;

        }
      )
      .join("");


  const selector =
    document.createElement(
      "div"
    );


  selector.className =
    "move-selector";


  selector.innerHTML = `

    <div class="move-selector-box">

      <h3>
        기술 선택
      </h3>

      <p>
        ${pokemon.name}
        Lv.${pokemon.level}
      </p>

      <div class="learn-move-list">

        ${names}

      </div>

      <button
        class="move-cancel"
      >
        취소
      </button>

    </div>

  `;


  document.body.appendChild(
    selector
  );


  selector.addEventListener(
    "click",
    e => {

      const moveButton =
        e.target.closest(
          ".learn-move"
        );


      if (!moveButton) {
        return;
      }


      const moveName =
        moveButton.dataset.moveName;


      const newMove =
        learnable.find(
          move =>
            move.name ===
            moveName
        );


      if (!newMove) {
        return;
      }


      if (
        pokemon.moves[slotIndex] &&
        pokemon.moves[slotIndex].name ===
          newMove.name
      ) {

        selector.remove();

        return;

      }


      pokemon.moves[slotIndex] =
        createMove(
          newMove
        );


      localStorage.setItem(
        "monsterGame",
        JSON.stringify(state)
      );


      selector.remove();


      render();


      toast(
        `${newMove.name}을(를) 배웠습니다!`
      );

    }
  );


  selector
    .querySelector(
      ".move-cancel"
    )
    .addEventListener(
      "click",
      () => {

        selector.remove();

      }
    );

}


/* =========================
   아이템 사용
========================= */

function useItem(id) {

  if (
    !state.inventory[id]
  ) {

    toast(
      "아이템이 없다."
    );

    return;

  }


  if (
    id === "rareCandy"
  ) {

    showRareCandySelector();

    return;

  }


  if (
    id === "potion"
  ) {

    state.inventory.potion--;


    save();


    toast(
      "상처약을 사용했다!"
    );


    return;

  }


  toast(
    "이 아이템은 아직 사용할 곳이 없습니다."
  );

}


/* =========================
   이상한사탕 선택
========================= */

function showRareCandySelector() {

  const selector =
    document.createElement(
      "div"
    );


  selector.className =
    "move-selector";


  const pokemonList =
    state.monsters
      .map(
        pokemon => {

          return `

            <button
              class="learn-move"
              data-monster-id="${pokemon.id}"
            >

              <b>
                ${pokemon.name}
                Lv.${pokemon.level}
              </b>

              <span>
                이상한사탕 사용
                →
                Lv.${pokemon.level + 1}
              </span>

            </button>

          `;

        }
      )
      .join("");


  selector.innerHTML = `

    <div class="move-selector-box">

      <h3>
        이상한사탕 사용
      </h3>

      <p>
        사탕을 줄 포켓몬을 선택하세요.
      </p>

      <div class="learn-move-list">

        ${pokemonList}

      </div>

      <button
        class="move-cancel"
      >
        취소
      </button>

    </div>

  `;


  document.body.appendChild(
    selector
  );


  selector.addEventListener(
    "click",
    e => {

      const pokemonButton =
        e.target.closest(
          "[data-monster-id]"
        );


      if (!pokemonButton) {
        return;
      }


      const pokemon =
        state.monsters.find(
          x =>
            String(x.id) ===
            String(
              pokemonButton.dataset
                .monsterId
            )
        );


      if (!pokemon) {
        return;
      }


      if (
        !state.inventory.rareCandy
      ) {

        selector.remove();


        toast(
          "갖고 있는 사탕이 없다.."
        );


        return;

      }


      state.inventory.rareCandy--;


      pokemon.level++;


      giveInitialMoves(
        pokemon
      );


      localStorage.setItem(
        "monsterGame",
        JSON.stringify(state)
      );


      selector.remove();


      render();


      toast(
        `${pokemon.name}의 레벨이 ${pokemon.level}이 되었다!`
      );

    }
  );


  selector
    .querySelector(
      ".move-cancel"
    )
    .addEventListener(
      "click",
      () => {

        selector.remove();

      }
    );

}


/* =========================
   상점 구매
========================= */

function buyItem(id) {

  const item =
    items[id];


  if (!item) {
    return;
  }


  if (
    state.money <
    item.price
  ) {

    toast(
      "돈이 부족합니다."
    );

    return;

  }


  state.money -=
    item.price;


  state.inventory[id]++;


  save();


  toast(
    `${item.name}을 구매했습니다.`
  );

}


/* =========================
   멤버 목록
========================= */

function renderMembers() {

  const list =
    document.getElementById(
      "member-list"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    members
      .map(
        member => `

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

        `
      )
      .join("");

}


/* =========================
   가방
========================= */

function renderBag() {

  const list =
    document.getElementById(
      "bag-list"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    Object.entries(items)
      .map(
        ([id, item]) => `

          <div class="item">

            <div class="item-icon">
              ${item.icon}
            </div>

            <div class="item-info">

              <b>
                ${item.name}
                ×
                ${state.inventory[id] || 0}
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

        `
      )
      .join("");

}


/* =========================
   상점
========================= */

function renderShop() {

  const specialName =
    document.getElementById(
      "special-name"
    );


  const specialPrice =
    document.getElementById(
      "special-price"
    );


  const shopList =
    document.getElementById(
      "shop-list"
    );


  if (
    !specialName ||
    !specialPrice ||
    !shopList
  ) {

    return;

  }


  const day =
    new Date().getDate();


  const special =
    [
      "potion",
      "ball",
      "herb"
    ][
      day % 3
    ];


  const specialItem =
    items[special];


  specialName.textContent =
    specialItem.name;


  specialPrice.textContent =
    Math.floor(
      specialItem.price * 0.7
    ).toLocaleString() +
    " G";


  shopList.innerHTML =
    Object.entries(items)
      .map(
        ([id, item]) => `

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
                G
                ·
                ${item.desc}
              </span>

            </div>

            <button
              class="buy"
              data-buy="${id}"
            >
              구매
            </button>

          </div>

        `
      )
      .join("");

}


/* =========================
   지도
========================= */

function renderMap() {

  const area =
    document.getElementById(
      "current-area"
    );


  const exploreCount =
    document.getElementById(
      "explore-count"
    );


  const encounter =
    document.getElementById(
      "encounter"
    );


  checkExploreDay();


  if (
    !area ||
    !encounter
  ) {

    return;

  }


  area.textContent =
    state.area;


  if (exploreCount) {

    exploreCount.textContent =
      `오늘의 탐색 ${state.exploreCount} / 10회`;

  }


  if (!state.encounter) {

    encounter.innerHTML = "";

    return;

  }


  const pokemon =
    state.encounter;


  encounter.innerHTML = `

    <div class="encounter-card">

      <h3>
        야생의
        ${pokemon.name}
        Lv.${pokemon.level}
        이(가) 나타났다!
      </h3>

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


/* =========================
   전체 렌더링
========================= */

function render() {

  money();

  renderMembers();

  renderMonsters();

  renderBag();

  renderShop();

  renderMap();

}


/* =========================
   시작
========================= */

/*
  실제 시작은 DOMContentLoaded에서
  checkLogin()으로 처리한다.
*/
