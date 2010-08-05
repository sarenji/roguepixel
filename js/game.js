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
function feed(s) {
    var r = s.split(' ');
    var l = r.length - 3,t, ret = "", a;
    // build chain
    while (--l) {
        t = r[0] + ' ' + r[1];
        if (!chain[t]) chain[t] = [];
        chain[t].push(r[2]);
        r.shift();
        words.push(r[2]);
    }
    // spit out some words
    l = 50;
    while (--l) {
        t = r[0] + ' ' + r[1];
        r[0] = r[1];
        a = t in chain ? chain[t] : words;
        ret += (r[1] = a[Math.floor(Math.random()*a.length)]) + " ";
    }
    return ret;
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
	$.get("http://www-users.cs.york.ac.uk/susan/sf/eyeargon/eyeargon.htm", function(data) {
	    alert(data);
	    $(".display-centre").html($("pre",data).html());
	});
});