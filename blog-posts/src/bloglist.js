const blogList = [
    {
        "2026": [
            {
                title: "Hyacinth's Multithreaded Server Architecture",
                desc: "Read about the design and implementation of netcode in Hyacinth, my multiplayer game engine.",
                link: "/blog-posts/hyacinth-server-architecture.html"
            }
        ]
    }
]

function drawBlogList() {
    for(let year in blogList[0]) {
        const yearSection = document.createElement("div");
        yearSection.className = "year_section";
        const yearHeader = document.createElement("h2");
        yearHeader.textContent = year;
        const yearBar = document.createElement("div");
        yearBar.className = "year_bar";
        yearSection.appendChild(yearHeader);
        yearSection.appendChild(yearBar);
        blogList[0][year].forEach(post => {
            const postCard = document.createElement("div");
            postCard.className = "post_card";
            postCard.innerHTML = `
                <a href='${post.link}'><h3>${post.title}</h3></a>
                <p>${post.desc}</p>
            `;
            yearSection.appendChild(postCard);
        });
        document.getElementById("blog_container").appendChild(yearSection);
    }
}

drawBlogList();