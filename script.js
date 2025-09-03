//document.write("-");

document.getElementById("info-btn").onclick = function() {
    document.getElementById("contenido-info").style.display = "flex";
};

document.getElementById("cerrar-cuadro").onclick = function() {
    document.getElementById("contenido-info").style.display = "none";
}