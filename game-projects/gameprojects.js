const software_dev_projects = [
  { 
    title: "Extrusion", 
    desc: "Escape from the laboratory",
    image: "UhrCTb.png",
    link: "https://violets321.itch.io/extrusion",
    notes: [
      "Made in Unreal Engine 5, for GMTK Game Jam 2024",
      "Designed the main level, placing lights and interactables to build the atmosphere of each room",
      "Implemented functionality of interactable objects, including the system to pick up and move boxes",
      "Developed visual effects, including the colored vignette and pixelation shaders"
    ],
  },
  { 
    title: "Dillo's Bounce", 
    desc: "Survive as an armadillo in the desert",
    image: "DB_banner.png",
    link: "https://violets321.itch.io/dillos-bounce",
    notes: [
      "Made in Unreal Engine 5, for Major Jam 6",
      "Implemented the primary physics-based rolling ball mechanic",
      "Designed 2 of the 3 levels in the game, as well as the animated main menu"
    ]
  },
  {
    title: "Bow Simulator", 
    desc: "Physically-based bow and arrow game",
    image: "BS_Banner.png",
    link: "/game-projects/BowShot/bowshot.html",
    notes: [
      "Made in Unreal Engine 4, solo project",
      "Modeled a compound bow in Blender, and created a small demo environment to showcase",      
    ],
    video: "https://www.youtube.com/watch?v=0BRGNQilR_4"
  },
  { 
    title: "Duel on the Heights",
    desc: "ML agent fighting ground",
    image: "faceaway.png",
    link: "https://violets321.itch.io/duel-on-the-heights",
    notes: [
      "Made in Unity, coursework",
      "Utilized Unity's Machine Learning Package to train agents to fight each other with swords and shields",
      "Implemented reward logic for model actions to encourage visually engaging behavior"
    ],
    video: "https://www.youtube.com/watch?v=iVZ3VUo3Asw"
  },
  { 
    title: "HiveGrind",
    desc: "Bee-themed platformer",
    image: "HG_Banner.png",
    link: "/game-projects/HiveGrind/hivegrind.html",
    notes: [
      "Made in Unity, for SGDA Summer 2022 Game Jam",
      "Collaborated with a team of artist and sound designers",
      "Implemented character movement, health bars, scene transitions, and a parallaxing background"
    ],
    video: "https://www.youtube.com/watch?v=jnBy11kBOgo"
  },
  { 
    title: "Lines of Sleight", 
    desc: "Card-themed dungeon crawler",
    image: "gameplay_still_3.png",
    link: "https://violets321.itch.io/line-of-sleight",
    notes: [
      "Made in Unity, coursework",
      "Implemented player movement and abilities",
      "Wrote logic for throwable projectile abilities, movement abilities, and melee attacks"
    ],
    video: "https://www.youtube.com/watch?v=M1ZTCqjLT8I"
  },
  { 
    title: "Tree Loot Box", 
    desc: "3D L-System generator",
    image: "d best.png",
    link: "https://violets321.itch.io/tree-loot-box",
    notes: [
      "Made in Unity, coursework",
      "<a href=''>Prototyped L-system generator using HTML and Javascript</a>",
      "Animated the expansion of the L-system and gamified using the concept of 'lootboxes'"
    ]
  },
];

const software_grid = document.getElementsByClassName("projects_grid")[0];

function openInfo(buttonId) {
  const escapedTitle = buttonId.replace(/'/g, "\\'");
  const infoDiv = document.getElementById(escapedTitle);
  infoDiv.classList.toggle("open");
}

software_dev_projects.forEach(project => {
  const cardContainer = document.createElement("div");
  cardContainer.className = "card_container";
  software_grid.appendChild(cardContainer);

  const card = document.createElement("div");
  card.className = `projects_card ${project.variant || ""}`.trim();

  if (project.video) {
    const videoLink = document.createElement("a");
    videoLink.className = "project_video";
    videoLink.href = project.video;
    videoLink.target = "_blank";
    videoLink.rel = "noopener noreferrer";
    videoLink.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#F6F4D1" stroke-width="1.5"/>
        <path d="M10 8.5L16 12L10 15.5V8.5Z" stroke="#F6F4D1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    card.appendChild(videoLink);
  }

  card.innerHTML += `
    <a href=${project.link} target="_blank"><h2>${project.title}</h2></a>
    <p>${project.desc}</p>
    <img src="/shared-resources/${project.image}" alt="${project.title} image">
  `;

  const ul = document.createElement("ul");
  ul.className = "project_notes";

  project.notes.forEach(note => {
    const li = document.createElement("li");
    li.className = "project_note";
    li.innerHTML = note;
    ul.appendChild(li);
  });
  card.querySelector("img").after(ul);

  const cardViewButton = document.createElement("div");
  cardViewButton.className = "button_container";

  const viewButton = document.createElement("button");
  viewButton.className = "view_button";
  viewButton.innerHTML = "VIEW PROJECT ->";
  viewButton.onclick = () => {
    window.open(project.link, "_blank");
  }
  cardViewButton.appendChild(viewButton);

  card.appendChild(cardViewButton);
  cardContainer.appendChild(card);
});