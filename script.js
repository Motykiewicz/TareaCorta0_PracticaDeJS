//document.write("-");



const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("close-btn");


document.getElementById("info-btn").onclick = function() {
    document.getElementById("cuadro-info").style.display = "flex";
};

document.getElementById("cerrar-cuadro").onclick = function() {
    document.getElementById("cuadro-info").style.display = "none";
}