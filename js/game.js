var c, clrs = [ "#fff", "#ccffcc" ], num = 8, grid=[], ctx, size, win, arr;
function rect(clr, x, y) {
	var a = Math.floor(size / num);
	var sx = (c.width - a * num) >> 1, sy = (c.height - a * num) >> 1;
	
	ctx.fillStyle = clr;
	ctx.fillRect(sx + x*a, sy + y*a,a,a);
}
function resize() {
	size = Math.floor(Math.min(c.width = win.width(), c.height = win.height()));
	draw();
}
function draw() {
	for (var y=0; y<num; y++)
		for (var x=0; x<num; x++)
			rect(clrs[grid[y][x]], x, y);
}
var chain = [], words = [];
// Markov chain, with hardcoded order of 3
// Optimized for size so hard it nearly becomes unreadable.
function feed(s) {
    var r = s.split(' '), l = r.length - 3, t, u = "", a;
    // build chain
    while (--l) {
        t = r.shift() + ' ' + r[0];
        (a=chain[t]=a||[]).push(r[1]);
        words.push(r[1]);
    }
    // spit out some words
    while (--l>-47) {
        a = chain[r[0] + ' ' + (r[0] = r[1])] || words;
        u += (r[1] = a[~~(Math.random()*a.length)]) + " ";
    }
    return u;
}
$(function() {
	// initialize canvas
	c   = $("canvas")[0];
	ctx = c.getContext("2d");
	
	// initialize grid
	var ctr = 0;
	for (var y=0; y<num; y++) {
		arr = [];
		for (var x=0; x<num; x++) {
			arr.push((++ctr)%2);
		}
		grid.push(arr);
	}
	
	// size up and draw window
	(win = $(window)).resize(resize);
	resize();
});