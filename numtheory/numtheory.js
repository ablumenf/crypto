function factorization(n) {
	const factors = factor(n);
	let formattedFactors = {};
	for(let i = 0; i < factors.length; i++) {
		if(!(factors[i] in formattedFactors)) formattedFactors[factors[i]] = 1;
		else formattedFactors[factors[i]]++;
	}
	return formattedFactors;
}

function phi(n) {
	if(n < 1) return 0;
	const formattedFactors = factorization(n);
	const primeFactors = Object.keys(formattedFactors);

	let rval = 1;
	for(let i = 0; i < primeFactors.length; i++) {
		const exp = formattedFactors[primeFactors[i]];
		rval *= Math.pow(primeFactors[i], exp-1)*(primeFactors[i] - 1);
	}
	return rval;
}