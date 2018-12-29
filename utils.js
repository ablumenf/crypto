/* basic utils */

function randomInt(min, max) { // random in [min, max)
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function gcd(a, b) {
    while(b > 0) {
        const temp = b;
        b = a % b;
        a = temp;
	}
    return a;
}

// returns [d, s, t] with d = as + bt
function extendedEuclid(a, b) {
	if(b === 0) return [a, 1, 0];

	const x = extendedEuclid(b, a % b);
	const d = x[0];
	const s = x[2];
	const t = x[1] - Math.floor(a/b) * s;
	return [d, s, t];
}

function modExp(a, b, n) {
	let rval = 1;
	while(b > 0) {
		if((b & 1) == 1) { // if b is odd
			rval = (rval * a) % n;
		}
		b >>= 1;
		a = (a * a) % n;
	}
	return trueMod(rval, n);
}

/* modular inverse */

function trueMod(a, n) {
	return ((a % n) + n) % n;
}

function inverse(a, n) {
	if(gcd(a, n) !== 1) return -1; // error
	return trueMod(extendedEuclid(a, n)[1], n);
}

/*
function inverse(a, p): // lazy way to compute a^(-1) (mod p)
    if(a == 0) {
        return -1; // indicates error
	}
    return modExp(a, p-2, p);
*/

/* primality checking */

function isPrime(N) {
    if(N === 0 || N === 1) {
		return false;
	}
    if(N === 2) {
        return true;
	}
    if(N % 2 === 0) {
        return false;
	}
    let s = N-1;
    while(s % 2 === 0) { // write N-1 = 2^k*s
        s /= 2
	}
    for(let i = 0; i < 50; i++) { // 50 iterations has failure rate of <= 1/2^100
        const a = randomInt(1, N);
        let exp = s;
        let mod = modExp(a, exp, N);
        while(exp !== N-1 && mod !== 1 && mod !== N-1) {
            mod = (mod * mod) % N;
            exp *= 2;
		}
        if(mod !== N-1 && exp % 2 === 0) {
            return false;
		}
	}
    return true;
}

function randomPrime(n) {
    let rval = 0;
    while(!isPrime(rval)) {
        rval = randomInt(Math.pow(10, n-1), Math.pow(10, n));
        if(rval <= 3) { // want p >= 5
            rval = 0;
		}
	}
    return rval;
}

/* ECC point-counting utils */

// assumes a is a square mod p
function sqrt(a, p) { // Shanks' algorithm for sqrt(a) (mod p)
    if (a % p === 0) { // sqrt(0) = 0
        return 0;
	}
    if(p % 4 === 3) { // easy for p = 3 (mod 4)
        return modExp(a, (p+1)/4, p);
	}
    if(p % 8 === 5 && modExp(a, (p-1)/4, p) === 1) { // sometimes easy for p = 5 (mod 8)
        return modExp(a, (p+3)/8, p);
	}
    let e = 0;
    let q = p-1;
    while(q % 2 === 0 && q > 0) {
        e++;
        q /= 2;
	}
    let n = 2; // 2 is frequently a non-square mod p
    while(jacobi(n, p) !== -1) {
         n = randomInt(2, p); // find a non-square mod p
	}
    let z = modExp(n, q, p);
    let y = z;
    let r = e;
    let x = modExp(a, (q-1)/2, p);
    let b = (a * x * x) % p;
    x = (a * x) % p;
    while(b % p !== 1) {
        let m = 0;
        while(modExp(b, 1 << m, p) !== 1) {
            m++;
		}
        t = modExp(y, 1 << (r-m-1), p);
        y = (t * t) % p;
        r = m;
        x = (x * t) % p;
        b = (b * y) % p;
	}
    return x;
}

function jacobi(a, p) {
    if(a % p === 0) return 0;
    let rval = 1;
    a = a % p;

    while(a !== 0) {
        while(a % 2 === 0) { // pull out factors of 2 and compute (2/n)
            a /= 2
            const mod8 = p % 8;
            if(mod8 === 3 || mod8 === 5) {
                if(rval == 1) {
					rval = -1;
				} else rval = 1;
			}
		}
        const temp = a;
        a = p; // swap a and p
        p = temp;

        if(a % 4 === 3 && p % 4 === 3) { // apply quadratic reciprocity
            if(rval === 1) {
				rval = -1;
			} else rval = 1;
		}
        a = a % p;
	}
    return rval;
}

/* factoring stuff */

function f(x, a, b) {
    return a*x*x + b;
}

function findFactor(n) {
    const maxiterssq = 0.7854*n; // pi/4 * n
    let x = randomInt(1, n);
    let y = x;
    let d = 1;
    let iters = 0;
    let a = randomInt(1, n);
    let b = randomInt(1, n);
    while(d === 1 || d === n) { // a match should be found within sqrt(pi*n/2) iterations on average
        if(iters*iters > maxiterssq) { // otherwise, choose a new function f (we may be running into a k-cycle if d = n)
            a = randomInt(1, n);
            b = randomInt(1, n);
            x = randomInt(1, n);
            y = x;
            iters = 0;
		}
        x = f(x, a, b) % n;
        y = f(f(y, a, b), a, b) % n;
        d = gcd(Math.abs(x-y), n);
        iters++;
	}
    return d;
}

function findPrimeFactor(n, factors) {
    if(isPrime(n)) {
        factors.push(n);
	}
    else {
        const temp = n / findFactor(n);
        findPrimeFactor(temp, factors);
	}
}

function factor(n) { // gives all prime factors, multiple copies of given primes for multiplicity
	factors = [];
    while(n % 2 === 0) {
        factors.push(2);
        n /= 2;
	}
    while(n % 3 === 0) {
        factors.push(3);
        n /= 3;
	}
    while(n > 1) {
        findPrimeFactor(n, factors);
        n /= factors[factors.length-1];
	}
	factors.sort((a, b) => a-b); // javascript sorting, sigh...
	return factors;
}

function findAllFactors(primeFactors) {
    let allFactors = [1];
    if(primeFactors.length === 0) return allFactors;
    else allFactors.push(primeFactors[0]);
    for(let i = 1; i < primeFactors.length; i++) {
        let temp = [];
        for(let j = 0; j < allFactors.length; j++) {
			let f = allFactors[j] * primeFactors[i];
            if(allFactors.indexOf(f) === -1) {
                temp.push(f);
			}
		}
        allFactors = allFactors.concat(temp);
	}
    allFactors.sort((a, b) => a-b); // javascript sorting, sigh...
    return allFactors;
}

function allFactors(n) { // uses Pollard Rho
    factors = factor(n); // find all prime factors first
    return findAllFactors(factors);
}

/* polynomial stuff */

function Polynomial(s) {
	let poly = {};
	s = s.replace(/\s/g, ""); // remove spaces
	s = s.replace(/-/g,"+");
	const split = s.split("+"); // split into list of monomials
	for(let i = 0; i < split.length; i++) {
		let val = parseMonomial(split[i]);
		if(val !== -1) {
			if(!(val in poly)) {
				poly[val] = true;
			} else {
				delete poly[val];
			}
		}
	}
	return poly;
}

function degree(p) {
	if(Object.keys(p).length === 0 && p.constructor === Object) {
		return -1; // deg(0) = -1
	}
	return Math.max.apply(null, Object.keys(p));
}

function polyEqual(p, q) {
	const pTerms = Object.keys(p).length;
	const qTerms = Object.keys(q).length;
	if(pTerms !== qTerms) return false;
	for(let i = 0; i < Object.keys(p).length; i++) {
		if(!(Object.keys(p)[i] in q)) {
			return false;
		}
	}
	return true;
}

function polyAdd(p, q) {
	let rval = Polynomial("");
	for(let i = 0; i < Object.keys(p).length; i++) {
		if(!(Object.keys(p)[i] in q)) {
			rval[Object.keys(p)[i]] = true;
		}
	}
	for(let i = 0; i < Object.keys(q).length; i++) {
		if(!(Object.keys(q)[i] in p)) {
			rval[Object.keys(q)[i]] = true;
		}
	}
	return rval;
}

function polyMultHelper(p, i) { // computes p -> z^i*p
	if(i < 0) return {}; // error
	let rval = Polynomial("");
	for(let j = 0; j < Object.keys(p).length; j++) {
		rval[parseInt(Object.keys(p)[j]) + i] = true;
	}
	return rval;
}

function polyMult(p, q) {
	let rval = Polynomial("");
	for(let i = 0; i < Object.keys(p).length; i++) {
		rval = polyAdd(rval, polyMultHelper(q, parseInt(Object.keys(p)[i]))); // applies distributive law
	}
	return rval;
}

function polyMod(p, q) { // stupid firefox bug?
	let rval = Polynomial(polyString(p));
	let pmax = degree(rval);
	let qmax = degree(q);
	while(pmax >= qmax) {
		rval = polyAdd(rval, polyMultHelper(q, pmax - qmax));
		pmax = degree(rval);
	}
	return rval;
}

function polyExp(p, k, q) { // p^k mod q
	k = trueMod(k, (1 << degree(q)) - 1); // reduce k mod the order of the group
	let temp = Polynomial(polyString(p));
	let rval = Polynomial("1");
	while(k > 0) {
		if((k & 1) === 1) {
			rval = polyMod(polyMult(rval, temp), q);
		}
		k >>= 1;
		temp = polyMod(polyMult(temp, temp), q);
	}
	return rval;
}

function polyInverse(p, q) { // p^(ord-1) = 1 by Lagrange, so p^(ord-2) = p^(-1)
	if(polyEqual(p, Polynomial(""))) {
		return polyomial(""); // error
	}
	return polyExp(p, (1 << degree(q)) - 2, q);
}

function polySqrt(p, q) { // sqrt(p) mod q
	const m = degree(q);
	return polyExp(p, 1 << (m-1), q);
}

function polyString(p) {
	let powers = Object.keys(p);
	if(powers.length === 0) return "0";
	let rval = "";
	powers.sort((x, y) => y-x);
	for(let i = 0; i < powers.length; i++) {
		if(parseInt(powers[i]) > 1) {
			rval += "z^" + powers[i] + " ";
		} else if(parseInt(powers[i]) === 1) {
			rval += "z ";
		} else { // i = 0
			rval += "1 ";
		}
		if(i < powers.length - 1) {
			rval += "+ ";
		}
	}
	return rval.trim();
}

function generatePolys(polys) {
	if(polys.length === 0) { // generate list [0, 1]
		polys.push(Polynomial("0"));
		polys.push(Polynomial("1"));
	}
	else { // generate list of polynomials of degree <= n from list of polynomials of degree <= n-1
		let list = [];
		for(let i = 0; i < polys.length; i++) {
			let temp = polyMultHelper(polys[i], 1);
			list.push(temp);
			temp = polyAdd(temp, Polynomial("1"));
			list.push(temp);
		}
		polys = list;
	}
	return polys;
}

function randomPoly(n) { // random poly of max degree n
	let p = Polynomial("");
	for(let i = 0; i <= n; i++) {
		if(Math.random() < 0.5) {
			p = polyAdd(p, Polynomial("z^" + i));
		}
	}
	return p;
}

function isValidMonomial(s) {
	if(s.length === 0) return true;
	let lastType = -1; // 0 corresponds to z, 1 corresponds to ^, 2 corresponds to number, 3 corresponds to +
	let c = s[0];
	if(c === 'z') lastType = 0;
	else if(c >= '0' && c <= '9') lastType = 2;
	else return false;

	for(let i = 1; i < s.length; i++) {
		c = s[i];
		if(c === 'z') {
			if(lastType !== -1) return false;
			lastType = 0;
		}
		if(c === '^') {
			if(lastType !== 0) return false;
			lastType = 1;
		}
		if(c >= '0' && c <= '9') {
			if(lastType === 0) return false;
			lastType = 2;
		}
	}
	return true;
}

function isValidPolynomial(s) {
	s = s.replace(/\s/g, ""); // remove spaces
	s = s.replace(/-/g,"+");
	for(let i = 0; i < s.length; i++) {
		if(s[i] !== 'z' && s[i] !== '^' && s[i] !== '+' && isNaN(s[i])) return false;
	}

	const split = s.split("+"); // split into list of monomials
	for(let i = 0; i < split.length; i++) {
		if(!isValidMonomial(split[i])) return false;
	}
	return true;
}

function parseMonomial(s) {
	if(s.length > 0) {
		const c = s[0];
		if(c === 'z') {
			if(s.length === 1) return 1;
			else return parseInt(s.substring(2, s.length));
		}
		if(c >= '0' && c <= '9') {
			const zIndex = s.indexOf('z');
			if(zIndex !== -1) {
				const coeff = parseInt(s.substring(0, zIndex)) % 2;
				if(s.find('^') === -1) { // if we see nz
					if(coeff !== 0) return 1;
				} else { // if we see nz^i
					if(coeff !== 0) return parseInt(s.substring(zIndex+2, s.length()));
				}
			}
			if(zIndex === -1 && s % 2 === 1) {
				return 0;
			}
		}
	}
	return -1; // 0 polynomial
}

/* output queue stuff for UI */

function enqueue(s, queue) {
	if(queue[queue.length-1] === s) return;
	if(queue.length >= maxQueueSize) {
		queue.splice(0, 1); // remove from front of queue
	}
	queue.push(s);
}

function printQueue(queue, element) { // print most recent first, so iterate backwards
	let message = "";
	for(let i = queue.length-1; i >= 0; i--) {
		message += "<div>" + queue[i] + "</div>";
	}
	element.innerHTML = message;
	renderTex(true);
}

function showAlert(s, selector) {
	const element = document.querySelector(selector);
	element.innerHTML = "<div class='alert alert-danger alert-dismissible fade show' role='alert'>"
	+ "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
	  + s + "</div>";
	renderTex(true);
	d3.select(selector)
		.selectAll("div")
		.transition()
		.delay(4000)
		.remove();
}

function invalidInt(s, message) {
	if(message) {
		return "Your choice of <span class='texUpdate' content='" + s + "'></span> is not an integer. Old value of <span class='tex' content='" + s + "'></span> retained.";
	}
	return "Your choice of <span class='texUpdate' content='" + s + "'></span> is not an integer. Random <span class='tex' content='" + s + "'></span> chosen instead.";
}

function invalidPoly(s) {
	return "Your choice of <span class='texUpdate' content='" + s + "'></span> is not a valid polynomial.";
}