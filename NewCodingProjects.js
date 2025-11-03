const game_dev_projects = [
  { title: "BOW SIMULATOR", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr", link: "https://ajnkrishnan.me/GAME_PROJECTS/BowShot/bowshot.html" },
  { title: "HIVEGRIND", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alt", link: "https://ajnkrishnan.me/GAME_PROJECTS/HiveGrind/hivegrind.html" },
  { title: "EXTRUSION", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr", link: "https://violets321.itch.io/extrusion" },
  { title: "DILLO'S BOUNCE", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://violets321.itch.io/dillos-bounce" },
  { title: "LINES OF SLEIGHT", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr", link: "https://violets321.itch.io/line-of-sleight" },
  { title: "DUEL ON THE HEIGHTS", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://violets321.itch.io/duel-on-the-heights" },
];

const software_dev_projects = [
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alt", link: "https://github.com/AKris0090/Orchid" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr", link: "https://github.com/AKris0090/Stingray" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr", link: "https://github.com/AKris0090/3D-Renderer" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr", link: "https://github.com/AKris0090/RayTracer" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "" },
];

const game_grid = document.getElementsByClassName("projects_grid")[0];

const software_grid = document.getElementsByClassName("projects_grid")[1];

game_dev_projects.forEach(project => {
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


