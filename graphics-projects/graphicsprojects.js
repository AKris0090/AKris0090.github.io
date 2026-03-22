const software_dev_projects = [
  { 
    title: "Orchid Game Engine", 
    desc: "Non-photorealistic forward rendered game engine", 
    image: "card.jpg",
    link: "https://github.com/AKris0090/Orchid",
    notes: [
      "Written in C++ using Vulkan and Nvidia PhysX APIs",
      "Features PBR textures, cascaded shadow mapping, bloom, compute skinning, and custom shaders including outlines and toon shading",
      "Implemented baked DDGI, using a grid of irradiance probes to ray trace indirect illumination",
      "Optimized using frustum culling and a depth pre-pass",
    ],
    video: "https://www.youtube.com/watch?v=NG24VTHqjNk"
  },
  { 
    title: "Stingray Raytracer", 
    desc: "Real-time GPU accelerated raytracing engine", 
    image: "stingrayDragon.png",
    link: "https://github.com/AKris0090/Stingray",
    notes: [
      "Written in C++, parallelized on the GPU using CUDA",
      "Features physically-based materials and soft shadowing",
      "Optimized to run in real-time using bounding volume heriarchies and iterative anti-aliasing"
    ]
  },
  {
    title: "CSE 160-Computer Graphics",
    desc: "Projects created for university coursework",
    image: "uni.png",
    link: "https://github.com/AKris0090/CSE160",
    notes: [
      "<a href='https://ajnkrishnan.me/CSE160/asgn2/asg2.html'>Assignment 2 (Blocky Animal, WebGL)</a>",
      "<a href='https://ajnkrishnan.me/CSE160/BLOCKYEXISTENCE/asg3.html'>Assignment 3 (Blocky World, WebGL)</a>",
      "<a href='https://ajnkrishnan.me/CSE160/asgn5/asg5.html'>Assignment 5 (Three.js, shell texturing)</a>"
    ]
  },
  { 
    title: "3D Model Viewer", 
    desc: "", 
    image: "3d-renderer-cover.png",
    link: "https://github.com/AKris0090/3D-Renderer",
    notes: [
      "Written in Java",
      "Implmented linear algebra utilities from scratch",
      "Features basic diffuse lighting, back-face culling, and a perspective camera",
      "Wrote an .OBJ file loader for uploading custom 3D objects"
    ],
    video: "https://www.youtube.com/watch?v=teK-erm_5Hg"
  },
  { 
    title: "Static Ray Tracer", 
    desc: "", 
    image: "raytrace_cover.jpg",
    link: "https://github.com/AKris0090/RayTracer",
    notes: [
      "Written in Java",
      "Followed the \"Ray Tracing in one Weekend\" tutorial, translating C++ code into Java"
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
    <h2>${project.title}</h2>
    <p>${project.desc}</p>
    <img src="/shared-resources/${project.image}" alt="${project.title} image">
    <div class="button_container">
      <button class="info_button" onclick="openInfo('${project.title}')">
        MORE INFO
        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 0 24 24" width="32px" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#F6F4D1" stroke-width="1.5"/>
          <path d="M8 10.5L12 14.5L16 10.5" stroke="#F6F4D1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="view_button" onclick="window.open('${project.link}', '_blank')">VIEW PROJECT -></button>
    </div>
  `;

  cardContainer.appendChild(card);

  const cardInfo = document.createElement("div");
  cardInfo.className = "card_info";
  cardInfo.id = `${project.title}`;
  
  const ul = document.createElement("ul");

  project.notes.forEach(note => {
    const li = document.createElement("li");
    li.innerHTML = note;
    ul.appendChild(li);
  });
  cardInfo.appendChild(ul);

  cardContainer.appendChild(cardInfo);

  software_grid.appendChild(cardContainer);
});