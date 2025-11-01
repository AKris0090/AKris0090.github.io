const game_dev_projects = [
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alt" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE" },
];

const software_dev_projects = [
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alt" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE", variant: "alr" },
  { title: "// Project Title", desc: "PROJECT DESCRIPTION GOES HERE"},
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
    <button>VIEW PROJECT</button>
  `;

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


