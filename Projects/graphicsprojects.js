const software_dev_projects = [
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/Orchid" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/Stingray" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/3D-Renderer" },
  { title: "Project Title", desc: "PROJECT DESCRIPTION GOES HERE", link: "https://github.com/AKris0090/RayTracer" },
];

const software_grid = document.getElementsByClassName("projects_grid")[0];

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
    <button onclick="window.open('${project.link}', '_blank')">VIEW PROJECT</button>
  `;

  card.appendChild(inset);
  software_grid.appendChild(card);
});


