function generateModulus() {
	const maxDigits = 5;
	const digits_p = randomInt(1, maxDigits+1);
	let digits_q = randomInt(1, maxDigits+1);
	while(digits_p + digits_q >= 10) { // make sure pq is < 2^30
		digits_q = randomInt(1, maxDigits+1);
	}
	const p = randomPrime(digits_p);
	let q = randomPrime(digits_q);
	while(q === p) {
		q = randomPrime(digits_q);
	}
	return p * q;
}

function phi(n) { // assumes n = pq, so phi(n) = (p-1)(q-1)
	const factors = factor(n);
	const p = factors[0], q = factors[1];
	return (p - 1) * (q - 1);
}

function generateExp(n) {
	const phiN = phi(n);
	let e = (n > 65537 && randomInt(1, 3) === 1) ? 65537 : 1; // 65537 is common for e since it's a prime with certain nice properties
	while(e === 1 || gcd(e, phiN) > 1) {
		e = randomInt(3, phiN);
	}
	return e;
}

function printFactorization(n) {
	const factors = factor(n);
	return "n = " + n + " = pq, where p = " + factors[0] + " and q = " + factors[1];
}

function printPhi(n) {
	const phiN = phi(n);
	return "<span class='texUpdate' content='\\phi(" + n + ") = '></span>" + phiN;
}