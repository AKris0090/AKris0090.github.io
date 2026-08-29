const images = [
    "./hyacinth-graphics/outline_final.jpg",
    "./hyacinth-graphics/character_color.jpg",
    "./hyacinth-graphics/character_color_grown.jpg",
    "./hyacinth-graphics/draw_outline_inv_stencil.jpg"
];

const image = document.getElementById("image-cycler");
const imageContainer = document.getElementById("image-container");

let currentImage = 0;

image.addEventListener("click", () => {
    currentImage = (currentImage + 1) % images.length;
    image.src = images[currentImage];
});