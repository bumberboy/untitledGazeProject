// Track mouse movement:
window.mouse = {
    x: 0,
    y: 0,

    handleMouseMove: function(event) {
        // Get the mouse position and normalize it to [-1, 1]
        mouse.x = (event.clientX / $(window).width()) * 2 - 1;
        mouse.y = (event.clientY / $(window).height()) * 2 - 1;
    },

    getMousePos: function() {
        return [mouse.x, mouse.y];
    },
};

document.onmousemove = mouse.handleMouseMove;

