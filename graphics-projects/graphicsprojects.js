const software_dev_projects = [
  { 
    title: "Hyacinth FPS Engine", 
    desc: "Deferred-rendered multiplayer FPS game engine", 
    image: "main.png",
    link: "https://github.com/AKris0090/Hyacinth",
    notes: [
      "Written in C++ using Vulkan, GLSL, and Nvidia PhysX API",
      "Engineered a multithreaded authoritative game server, featuring client-side prediction and server reconciliation, interpolation, and lag compensation. To learn more, check out <a href='https://ajnkrishnan.me/blog-posts/hyacinth-server-architecture.html'>this blog post</a>",
      "Programmed hardware-traced reflections, stencil-buffer outlines, FXAA, third-person locomotion, and a custom UI system",
      "Implemented volume-based baked DDGI, using a grid of irradiance probes to ray trace indirect illumination. Modeled after Overwatch’s DDGI system; optimized with a stencil buffer",
    ],
    video: "https://www.youtube.com/watch?v=YgR1PEGyKbY"
  },
  { 
    title: "Orchid Game Engine", 
    desc: "Non-photorealistic forward rendered game engine", 
    image: "card.jpg",
    link: "https://github.com/AKris0090/Orchid",
    notes: [
      "Written in C++ using Vulkan, GLSL, and Nvidia PhysX API",
      "Features PBR textures, cascaded shadow mapping, bloom, compute skinning, and custom shaders including outlines and toon shading",
      "Optimized using frustum culling and a depth pre-pass, reducing frame time from 8.1 ms/frame to 6.15 ms/frame (32%)",
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
      "Optimized to trace over 850,000 primitives in real-time using bounding volume heriarchies"
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