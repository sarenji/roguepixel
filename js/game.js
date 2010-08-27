//////////////////////////////////
// Globals
//////////////////////////////////
// the sheer amount of globals almost makes me cry.
var c, // canvas element
    ctx, // canvas context
    clrs   = [ "#000", "#391f05", "#2b1703" ], // colors
    grid   = [], // game grid
    ox     = 0,  // offset x
    oy     = 0,  // offset y
    level_cache = [],
    rand   = Math.random,
    floor  = Math.floor,
    MIN_ROOMS = 2,
    MAX_ROOMS = 4,
    MIN_ROOM_SIZE = 1,
    MAX_ROOM_SIZE = 5,
    //////////////////////////////////
    // Map keydown directions
    //////////////////////////////////
    keys = {
        37 : [ -1,  0 ],
        39 : [  1,  0 ],
        38 : [  0, -1 ],
        40 : [  0,  1 ]
    },
    enemies = [];
function rand_range(min, max) {
    return floor(rand() * (max + 1 - min)) + min;
}
function choice() {
    var a = arguments, b = a.length == 1 ? a[0] : a;
    return b[floor(rand()*b.length)];
}
//////////////////////////////////
// Display code
//////////////////////////////////
function rect(clr, x, y, w, h) {
	ctx.fillStyle = clr;
	ctx.fillRect(x, y, w||20, h||20);
}
function draw() {
    // draw grid
    var x, y, a, b;
	for (y=0; y<grid[0].length; y++)
		for (x=0; x<grid.length; x++) {
		    rect(clrs[grid[y][x]], x*20 + ox, y*20 + oy);
		}
	// draw you
	rect('#87df51', 140, 140); // you are always centered on the screen
	// draw enemies
	x = enemies;
	for (var e in x) {
	    y = x[e];
	    rect('#df5151', y.x + ox, y.y + oy);
	}
	// draw UI
	//ctx.drawText(310, 10, "Test");
}
//////////////////////////////////
// Crappy 10k particle generation
//////////////////////////////////
var particles = [];
function generate_particles(x, y, how_many, colors) {
    var i;
    for (i=0; i<how_many; i++) {
        particles.push({
            x : x,
            y : y,
            delay: i * 10 // every 10 milliseconds
        });
    }
}
//////////////////////////////////
// Markov chains
//////////////////////////////////
var chain = [], words = [];
// Markov chain, with hardcoded order of 3
// Optimized for size so hard it nearly becomes unreadable.
function feed(s) {
    var r = s.split(' '), l = r.length - 3, u = "", a;
    // build chain
    while (--l) {
        (a=chain[r.shift() + ' ' + r[0]]=a||[]).push(r[1]);
        words.push(r[1]);
    }
    // spit out some words
    while (--l>-47) {
        a = chain[r[0] + ' ' + (r[0] = r[1])] || words;
        u += (r[1] = a[~~(Math.random()*a.length)]) + " ";
    }
    return u;
}
//////////////////////////////////
// Entities
//////////////////////////////////
var Char = {
    x : 0,
    y : 0,
    hp : 13,
    atk : 1
}, g = {
    name : "Gnackdaggler",
    hp   : 2,
    atk  : 1,
    lvl  : 1, // min level of dungeon to encounter
    rep  : 'g'
}, w = {
    name : "Will-o-wisp",
    hp   : 1,
    atk  : 1,
    range : 2,
    lvl  : 2, // min level of dungeon to encounter
    rep  : 'w'
}, N = {
    name : "NPC",
    lvl  : 1,
    rep  : 'N'
};
//////////////////////////////////
// Levels
//////////////////////////////////
function get_level(num) {
    if (!level_cache[num])
        level_cache[num] = gen(rand_range(MIN_ROOMS + num, MAX_ROOMS + num),
                               rand_range(MIN_ROOMS + num, MAX_ROOMS + num),
                               MIN_ROOM_SIZE,
                               MAX_ROOM_SIZE);
    return level_cache[num];
}
// Random dungeon generator
function gen(num_rooms_w, num_rooms_h, min_size, max_size) {
    var lvl=[], r=[], w, h, x=0, y=0, a, b, d, i;
    for (a=0; a<num_rooms_w; a++) {
        for (b=0; b<num_rooms_h; b++) {
            r.push({
                x : a * max_size,
                y : b * max_size,
                w : max_size,
                h : max_size
            });
        }
    }
    for (a=0; a<max_size*num_rooms_w;a++) {
        d = [];
        for (b=0; b<max_size*num_rooms_h;b++)
            d.push(0);
        lvl.push(d);
    }
    for (c in r) {
        d = r[c];
        for (h=d.y;h<d.y+d.h;h++)
            for (w=d.x;w<d.x+d.w;w++)
                lvl[w][h] = 1;
    }
    var rep = "";
    for (a=0;a<lvl.length;a++) {
        for (b=0;b<lvl[0].length;b++) {
            rep += lvl[a][b] + ",";
        }
        rep += "\n";
    }
    //alert(rep);
    return lvl;
    //for (i=0;i<)
    while (num_rooms--) {
        d = true;
        // create dimensions of a new room
        w = rand_range(min_size, max_size);
        h = rand_range(min_size, max_size);
        while (d) {
            d = false;
            // get new direction to go into, then a (x,y) to start from
            a = choice([0, choice(-1, 1)], [choice(-1, 1), 0]);
            x = a[0] == 0 ? rand_range(x, x + w) : x + w*(a[0] == 1 ? 1 : 0);
            y = a[1] == 0 ? rand_range(y, y + h) : y + h*(a[1] == 1 ? 1 : 0);
            alert(a + "\n" + x + "," + y)
            /*
            a = choice([choice(x, x+w),     rand_range(y, y+h)],
                       [rand_range(x, x+w), choice(y, y+h)]);
            y = a[1];
            */
            // we can't build this room with something in the way!
            // TODO: There will always be something in the way...
            for (i=0; i<w*h; i++) {
                a = x + i%w;
                b = y + ~~(i/w);
                // check bounds
                if (a >= lvl.length || b >= lvl[a].length) continue;
                // if something is in the way, redo room selection process.
                if (lvl[a][b] != 0) {
                    // TODO: uncomment when fixed
                    //d = true;
                    break;
                }
            }
        }
        // TODO: make space as necessary for the room.
        // make room.
        for (i=0; i<w*h; i++) {
            a = 1;
            if (rand_range(0, 999) < 4) {
                // TODO: add Chest.
            }
            // TODO: add monster somewhere.
            lvl[x + i%w][y + ~~(i/w)] = a;
        }
        // TODO: add walls
        // we need to open up a wall if one exists between rooms.
        if (lvl[x][y] == 2)
            lvl[x][y] = 1;
    }
}
//////////////////////////////////
// Main function
//////////////////////////////////
$(function() {
	// initialize canvas
	c   = $("canvas")[0];
	c.height = "300";
	c.width = "500";
	ctx = c.getContext("2d");
	// initialize grid
	// TODO: Generate random dungeon
	// TODO: Then generate image of floor.
	var ctr = 0, arr;
	grid = get_level(0);
	
	draw(); // Let there be light!
	
	// TODO: Create keylisteners
	$(document).keydown(function(e) {
	    var a = e.keyCode, b = e.preventDefault;
	    // move character
	    if (a in keys) {
	        b();
	        ox += keys[a][0];
	        oy += keys[a][1];
	        // TODO: Update monsters
	        draw();
	    }
	    // game commands
	    //if (a == )
	});
});