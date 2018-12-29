function order(g, p) { // assume p is a prime
	if(g < 1) return -1; // error
	if(g === 1) return 1;
	const factors = allFactors(p-1);
	return factors[
		factors.map((x, i) => [modExp(g, x, p), i])
			.filter(x => x[0] === 1)[0][1]
	];
}

function isPrimRoot(g, p) {
	return order(g, p) === p-1;
}

function findPrimRoot(p) {
	if(p === 2) return 1;
	let g = (Math.random() < 0.4) ? 2 : randomInt(3, p-1);
	while(!isPrimRoot(g, p)) {
		g = randomInt(3, p-1);
	}
	return g;
}

// could do Pollard-Rho, but the code would be lengthy, and p can only be up to 99991 anyway
function discreteLog(g, y, p) { // solve g^x = y mod p for x
	exponents = Array.apply(null, {length: p-1})
		.map(Number.call, Number);
	const results = exponents.map((x, i) => [modExp(g, x, p), i]).filter(res => res[0] === y);
	return results.length > 0 ? results[0][1] : -1; // -1 = error
}