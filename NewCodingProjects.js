const game_dev_projects = [
  { title: "BOW SIMULATOR", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://ajnkrishnan.me/GAME_PROJECTS/BowShot/bowshot.html", image: "/HOMEPAGE_RESOURCES/BS_Banner.png" },
  { title: "HIVEGRIND", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://ajnkrishnan.me/GAME_PROJECTS/HiveGrind/hivegrind.html", image: "/HOMEPAGE_RESOURCES/HG_Banner.png" },
  { title: "EXTRUSION", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://violets321.itch.io/extrusion", image: "/HOMEPAGE_RESOURCES/UhrCTb.png" },
  { title: "DILLO'S BOUNCE", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://violets321.itch.io/dillos-bounce", image: "/HOMEPAGE_RESOURCES/DB_banner.png" },
  { title: "LINES OF SLEIGHT", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://violets321.itch.io/line-of-sleight", image: "/HOMEPAGE_RESOURCES/gameplay_still_3.png" },
  { title: "DUEL ON THE HEIGHTS", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://violets321.itch.io/duel-on-the-heights", image: "/HOMEPAGE_RESOURCES/faceaway.png" },
];

const software_dev_projects = [
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/Orchid" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/Stingray" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/3D-Renderer" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/RayTracer" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "" },
];

const game_grid = document.getElementsByClassName("projects_grid")[0];

const software_grid = document.getElementsByClassName("projects_grid")[1];

game_dev_projects.forEach(project => {
  const card = document.createElement("div");
  card.className = `projects_card ${project.variant || ""}`.trim();

  const inset = document.createElement("div");
  inset.className = `card_inset ${project.variant || ""}`.trim();

  const filter = document.createElement("div");
  filter.className = "filter2";
  inset.appendChild(filter);

  inset.innerHTML += `
    <h2>${project.title}</h2>
    <p>${project.desc}</p>
    <img src="${project.image}" alt="${project.title} Banner Image"/>
  `;

  card.innerHTML += `<button onclick="location.href='${project.link}'">VIEW PROJECT</button>`;

  card.appendChild(inset);
  game_grid.appendChild(card);
});

software_dev_projects.forEach(project => {
  const card = document.createElement("div");
  card.className = `projects_card ${project.variant || ""}`.trim();

  const inset = document.createElement("div");
  inset.className = `card_inset ${project.variant || ""}`.trim();

  if (project.variant === "alt" || project.variant === null) {
    const filter = document.createElement("div");
    filter.className = "filter";
    inset.appendChild(filter);
  }

  inset.innerHTML += `
    <h2>${project.title}</h2>
    <p>${project.desc}</p>
    <button>VIEW PROJECT</button>
  `;

  card.appendChild(inset);
  software_grid.appendChild(card);
});


