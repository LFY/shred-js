function sample_integer(i) {
    return Math.floor(i * Math.random());
}

function log_flip(lp) {
    return Math.random() < Math.exp(lp);
}

var num_sites = 1000;
var sites = [];
var prop_sites = [];

var sample_site = function () { return sample_integer(2); }

for (var i = 0; i < num_sites; i++) {
    sites.push(sample_site());
    prop_sites.push(sites[i]);
}

var eq = function(x, y) {
    if (x == y) {
        return 0.0;
    } else {
        return Math.log(0.1);
    }
}

var score = function(sites) {
    var n = sites.length; 
    var res = 0.0;
    for (var i = 0; i < n - 1; i++) {
        res += eq(sites[i], sites[i + 1]);
    }
    return res;
}

var niter = 1000000;
var skip = niter / 10;
var iter = 0;

while (iter < niter) {
    prop_site = sample_integer(num_sites);

    prop_sites[prop_site] = sample_site();

    curr_score = score(sites);
    prop_score = score(prop_sites);

    if (log_flip(prop_score - curr_score)) {
        sites[prop_site] = prop_sites[prop_site];
    } else {
        prop_sites[prop_site] = sites[prop_site];
    }

    iter += 1;
    if ((iter % skip) == 0) {
        console.log(sites.slice(0, 5));
    }
}


